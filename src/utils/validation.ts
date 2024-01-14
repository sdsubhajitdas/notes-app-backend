import * as Yup from "yup";

export const loginSchema = Yup.object({
  email: Yup.string()
    .email("email id invalid")
    .required("email field is required"),
  password: Yup.string().required("password field is required"),
});

export const signupSchema = Yup.object({
  email: Yup.string()
    .email("email id invalid")
    .required("email field is required"),
  password: Yup.string()
    .min(8, "password needs to be minimum 8 characters long")
    .max(20, "password cannot be more than 20 characters long")
    .required("password field is required"),
});

export const createNoteSchema = Yup.object({
  title: Yup.string(),
  body: Yup.string().required("body field is required"),
});

export const updateNoteSchema = Yup.object({
  id: Yup.number().required("note id is required"),
  title: Yup.string().required("title field is required"),
  body: Yup.string().required("body field is required"),
});

export const shareNoteSchema = Yup.object({
  noteId: Yup.number().required("note id is required"),
  userId: Yup.number().required("user id is required"),
});
