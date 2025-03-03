export interface User {
    id?: number;
    nom: string;
    email: string;
    role: string;
    // Password not included as it shouldn't be stored in the frontend
  }