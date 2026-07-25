import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";

import css from "./App.module.css";

import { createNote, deleteNote, fetchNotes } from "../../services/noteService";
import type { NoteTag } from "../../types/note";

import NoteList from "../NoteList/NoteList";
import Pagination from "../Pagination/Pagination";
import Modal from "../Modal/Modal";
import NoteForm from "../NoteForm/NoteForm";
import SearchBox from "../SearchBox/SearchBox";

interface NoteFormValues {
  title: string;
  content: string;
  tag: NoteTag;
}

export default function App() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const handleSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, 500);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["notes", page, search],
    queryFn: () =>
      fetchNotes({
        page,
        perPage: 12,
        search,
      }),
  });

  const createNoteMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notes"],
      });

      setIsModalOpen(false);
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notes"],
      });
    },
  });

  const handleCreateNote = (values: NoteFormValues) => {
    createNoteMutation.mutate(values);
  };

  const handleDeleteNote = (id: string) => {
    deleteNoteMutation.mutate(id);
  };

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={search} onChange={handleSearch} />

        {data && data.totalPages > 1 && (
          <Pagination
            totalPages={data.totalPages}
            currentPage={page}
            onPageChange={setPage}
          />
        )}

        <button
          className={css.button}
          type="button"
          onClick={() => setIsModalOpen(true)}
        >
          Create note +
        </button>
      </header>

      {isLoading && <p>Loading...</p>}

      {isError && <p>Something went wrong.</p>}

      {data && data.notes.length > 0 && (
        <NoteList notes={data.notes} onDelete={handleDeleteNote} />
      )}

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <NoteForm
            onCancel={() => setIsModalOpen(false)}
            onSubmit={handleCreateNote}
          />
        </Modal>
      )}
    </div>
  );
}
