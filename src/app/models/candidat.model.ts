export interface Candidat {
  id?: number;
  sex: string;
  category: string;
  cin: string;
  lastName: string;
  firstName: string;
  birthday: string;
  placeBirth?: string;
  adress?: string;
  city?: string;
  email?: string;
  gsm: string;
  startingDate?: string;
  initialPrice?: number;
  vehicule?: string;
  moniteur?: string;
}