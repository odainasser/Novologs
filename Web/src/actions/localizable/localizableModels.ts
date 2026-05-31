export interface UpdateLocalizable {
  id: string;
  value: string;
    localizedStrings?: {
      localizableId: string;
      language: string;
      value: string;
    }[];
}
