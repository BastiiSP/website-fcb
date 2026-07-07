export type SportheimAnfrageTyp = "anfrage" | "sperrung";

export type SportheimAnfrageStatus = "offen" | "angenommen" | "abgelehnt";

export type SportheimAnfrage = {
  id: string;
  typ: SportheimAnfrageTyp;
  vorname: string | null;
  nachname: string | null;
  email: string | null;
  telefonnummer: string | null;
  startzeit: string;
  endzeit: string;
  anlass: string | null;
  nachricht: string | null;
  status: SportheimAnfrageStatus;
  erstellt_von: string | null;
  created_at: string;
  updated_at: string;
};

export type SportheimAnfrageInsert = {
  id?: string;
  typ?: SportheimAnfrageTyp;
  vorname?: string | null;
  nachname?: string | null;
  email?: string | null;
  telefonnummer?: string | null;
  startzeit: string;
  endzeit: string;
  anlass?: string | null;
  nachricht?: string | null;
  status?: SportheimAnfrageStatus;
  erstellt_von?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type SportheimAnfrageUpdate = Partial<SportheimAnfrageInsert>;

export type SportheimBelegteZeit = {
  startzeit: string;
  endzeit: string;
  typ: SportheimAnfrageTyp;
};

export type SportheimAnfragenDatabase = {
  public: {
    Tables: {
      sportheim_anfragen: {
        Row: SportheimAnfrage;
        Insert: SportheimAnfrageInsert;
        Update: SportheimAnfrageUpdate;
        Relationships: [
          {
            foreignKeyName: "sportheim_anfragen_erstellt_von_fkey";
            columns: ["erstellt_von"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      sportheim_belegte_zeiten: {
        Args: Record<string, never>;
        Returns: SportheimBelegteZeit[];
      };
    };
  };
};
