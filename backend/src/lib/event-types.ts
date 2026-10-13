export const FIELD_TYPES = [
  "short_text",
  "long_text",
  "email",
  "number",
  "select",
  "radio",
  "checkbox",
  "date",
  "time",
  "phone",
  "url",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export const FIELD_LABELS: Record<FieldType, string> = {
  short_text: "Short text",
  long_text: "Paragraph",
  email: "Email",
  number: "Number",
  select: "Dropdown",
  radio: "Single choice",
  checkbox: "Multiple choice",
  date: "Date",
  time: "Time",
  phone: "Phone",
  url: "URL",
};

export const OPTION_TYPES: FieldType[] = ["select", "radio", "checkbox"];

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
}

export type EventStatus = "draft" | "open" | "closed";

export interface EventTheme {
  accent: string;
  banner?: string;
  layout: "centered" | "split";
}

export interface EventDoc {
  slug: string;
  title: string;
  description: string;
  bannerUrl?: string;
  location?: string;
  startsAt?: string;
  status: EventStatus;
  theme: EventTheme;
  fields: FormField[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  uid: string;
  email: string;
  name: string | null;
  photoURL: string | null;
  answers: Record<string, string | string[]>;
  createdAt: string;
}
