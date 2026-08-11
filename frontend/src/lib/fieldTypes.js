import {
  Type,
  AlignLeft,
  Mail,
  Phone,
  Hash,
  ChevronDownSquare,
  CircleDot,
  CheckSquare,
  Calendar,
  Star,
  Upload,
  ToggleLeft,
  MapPin,
  Link as LinkIcon,
  Lock,
  Minus,
  Heading,
  Pilcrow,
  Image,
} from "lucide-react";

/**
 * Single source of truth for every supported field type.
 * Drives the palette, the builder, validation, and the public renderer.
 */
export const FIELD_DEFS = {
  short_text: { label: "Short Text", icon: Type, group: "input", hasOptions: false, placeholder: "Type your answer" },
  long_text: { label: "Long Text", icon: AlignLeft, group: "input", hasOptions: false, placeholder: "Type your answer" },
  email: { label: "Email", icon: Mail, group: "input", hasOptions: false, placeholder: "name@example.com" },
  phone: { label: "Phone", icon: Phone, group: "input", hasOptions: false, placeholder: "+1 (555) 000-0000" },
  number: { label: "Number", icon: Hash, group: "input", hasOptions: false, placeholder: "0" },
  url: { label: "URL", icon: LinkIcon, group: "input", hasOptions: false, placeholder: "https://" },
  password: { label: "Password", icon: Lock, group: "input", hasOptions: false, placeholder: "••••••••" },
  address: { label: "Address", icon: MapPin, group: "input", hasOptions: false, placeholder: "Street address" },
  dropdown: { label: "Dropdown", icon: ChevronDownSquare, group: "choice", hasOptions: true },
  radio: { label: "Multiple Choice", icon: CircleDot, group: "choice", hasOptions: true },
  checkbox: { label: "Checkboxes", icon: CheckSquare, group: "choice", hasOptions: true },
  yes_no: { label: "Yes / No", icon: ToggleLeft, group: "choice", hasOptions: false },
  date: { label: "Date Picker", icon: Calendar, group: "advanced", hasOptions: false },
  rating: { label: "Rating", icon: Star, group: "advanced", hasOptions: false },
  file: { label: "File Upload", icon: Upload, group: "advanced", hasOptions: false },
  section: { label: "Section Divider", icon: Minus, group: "layout", hasOptions: false, static: true },
  heading: { label: "Heading", icon: Heading, group: "layout", hasOptions: false, static: true },
  paragraph: { label: "Paragraph", icon: Pilcrow, group: "layout", hasOptions: false, static: true },
  image: { label: "Image Block", icon: Image, group: "layout", hasOptions: false, static: true },
};

export const FIELD_GROUPS = [
  { id: "input", label: "Inputs" },
  { id: "choice", label: "Choices" },
  { id: "advanced", label: "Advanced" },
  { id: "layout", label: "Layout" },
];

export const STATIC_TYPES = Object.keys(FIELD_DEFS).filter((t) => FIELD_DEFS[t].static);
export const OPTION_TYPES = Object.keys(FIELD_DEFS).filter((t) => FIELD_DEFS[t].hasOptions);

export function isStatic(type) {
  return STATIC_TYPES.includes(type);
}

let counter = 0;
function uid(prefix = "q") {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter}`;
}

/** Build a fresh question object with sensible defaults for its type. */
export function createField(type) {
  const def = FIELD_DEFS[type];
  const base = {
    id: uid(),
    type,
    label: def.static ? def.label : `${def.label} question`,
    placeholder: def.placeholder || "",
    description: "",
    helpText: "",
    required: false,
    defaultValue: "",
    options: [],
    content: "",
    validation: { minLength: null, maxLength: null, min: null, max: null, pattern: "", message: "" },
  };

  if (def.hasOptions) {
    base.options = [
      { id: uid("opt"), label: "Option 1", value: "" },
      { id: uid("opt"), label: "Option 2", value: "" },
      { id: uid("opt"), label: "Option 3", value: "" },
    ];
  }
  if (type === "heading") base.content = "Section heading";
  if (type === "paragraph") base.content = "Add a short description to guide your respondents.";
  if (type === "image") base.content = "";

  return base;
}

export { uid };
