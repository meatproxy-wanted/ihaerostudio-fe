import { z } from "zod";

export const idSchema = z.string().min(1);

export const isoDateTimeSchema = z.iso.datetime();

export const revisionSchema = z.number().int().nonnegative();

/** A character range inside one source paragraph that a sentence or item relies on. */
export const anchorSchema = z
  .object({
    paragraphId: idSchema,
    start: z.number().int().nonnegative(),
    end: z.number().int().positive(),
  })
  .refine((anchor) => anchor.end > anchor.start, {
    message: "근거 범위의 끝은 시작보다 뒤여야 해요.",
  });
export type Anchor = z.infer<typeof anchorSchema>;

/** A "please check this" marker the AI attaches to an extracted item. */
export const aiFlagSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
});
export type AiFlag = z.infer<typeof aiFlagSchema>;

export const toneSchema = z.enum(["haeyo", "hamnida"]);
export type Tone = z.infer<typeof toneSchema>;

export const namingSchema = z.enum(["initial", "role", "legal"]);
export type Naming = z.infer<typeof namingSchema>;

export const illustrationsSchema = z.enum(["with", "none"]);
export type Illustrations = z.infer<typeof illustrationsSchema>;

export const settingsSchema = z.object({
  tone: toneSchema,
  naming: namingSchema,
  illustrations: illustrationsSchema,
});
export type Settings = z.infer<typeof settingsSchema>;

export const DEFAULT_SETTINGS: Settings = {
  tone: "haeyo",
  naming: "initial",
  illustrations: "with",
};

export function anchorsEqual(a: Anchor, b: Anchor) {
  return (
    a.paragraphId === b.paragraphId && a.start === b.start && a.end === b.end
  );
}
