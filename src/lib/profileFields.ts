export interface EditableProfileFields {
  email?: string;
  contactEmail?: string;
  displayName?: string;
  photoUrl?: string;
  emailVerified?: boolean;
}

export const EDITABLE_PROFILE_FIELDS = [
  "email",
  "contactEmail",
  "displayName",
  "photoUrl",
  "emailVerified",
] as const satisfies readonly (keyof EditableProfileFields)[];

/** Drops credits and any other non-editable profile fields before a client write. */
export function pickEditableProfileFields(
  input: EditableProfileFields & { credits?: number }
): EditableProfileFields {
  const patch: EditableProfileFields = {};
  if (input.email !== undefined) patch.email = input.email;
  if (input.contactEmail !== undefined) patch.contactEmail = input.contactEmail;
  if (input.displayName !== undefined) patch.displayName = input.displayName;
  if (input.photoUrl !== undefined) patch.photoUrl = input.photoUrl;
  if (input.emailVerified !== undefined) patch.emailVerified = input.emailVerified;
  return patch;
}
