"use client";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default function Editor({ data, onChange, config }) {
  return (
    <CKEditor
      editor={ClassicEditor}
      data={data}
      onChange={onChange}
      config={config}
    />
  );
}