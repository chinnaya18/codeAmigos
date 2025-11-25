import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

export default function FileViewer() {
  const { repoId, fileId } = useParams();

  const [content, setContent] = useState("");
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get(`/files/${repoId}/file/${fileId}`);

        if (!res.data?.metadata) {
          setError("File metadata missing.");
          return;
        }

        setMeta(res.data.metadata);

        // Fetch raw content from Cloudinary
        const fileRes = await fetch(res.data.cloudinaryUrl);
        const text = await fileRes.text();
        setContent(text);
      } catch (err) {
        console.error("File load error:", err);
        setError("Failed to load file.");
      }

      setLoading(false);
    };

    load();
  }, [repoId, fileId]);

  const save = async () => {
    if (!meta) {
      alert("File metadata missing. Cannot save.");
      return;
    }

    setSaving(true);

    try {
      const blob = new Blob([content], { type: "text/plain" });
      const fd = new FormData();
      fd.append("file", blob, meta.name);

      const res = await API.put(`/files/${repoId}/file/${fileId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMeta(res.data);
      alert("Saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      alert("Save failed.");
    }

    setSaving(false);
  };

  if (loading) return <div className="text-light p-4">Loading file…</div>;
  if (error) return <div className="text-danger p-4">{error}</div>;

  return (
    <div className="container text-light mt-4">
      <h3>{meta?.name}</h3>

      <textarea
        style={{ width: "100%", height: 400 }}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="form-control bg-dark text-light"
      />

      <button className="btn btn-success mt-3" onClick={save} disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
