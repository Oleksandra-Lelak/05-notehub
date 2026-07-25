import axios from "axios";
import type { Note, NoteTag } from "../types/note";

const API_URL = "https://notehub-public.goit.study/api";

const noteHubApi = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_NOTEHUB_TOKEN}`,
  },
});

interface FetchNotesParams {
  page: number;
  perPage: number;
  search?: string;
}

interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

interface CreateNoteParams {
  title: string;
  content: string;
  tag: NoteTag;
}

export async function fetchNotes({
  page,
  perPage,
  search,
}: FetchNotesParams): Promise<FetchNotesResponse> {
  const response = await noteHubApi.get<FetchNotesResponse>("/notes", {
    params: {
      page,
      perPage,
      search,
    },
  });

  return response.data;
}

export async function createNote(note: CreateNoteParams): Promise<Note> {
  const response = await noteHubApi.post<Note>("/notes", note);

  return response.data;
}

export async function deleteNote(noteId: string): Promise<Note> {
  const response = await noteHubApi.delete<Note>(`/notes/${noteId}`);

  return response.data;
}
