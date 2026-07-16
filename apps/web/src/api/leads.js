import { request } from "./client.js";

export function listLeads(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
  ).toString();
  return request(`/leads${query ? `?${query}` : ""}`);
}

export function getLead(id) {
  return request(`/leads/${id}`);
}

export function createLead(data) {
  return request("/leads", { method: "POST", body: data });
}

export function updateLead(id, data) {
  return request(`/leads/${id}`, { method: "PATCH", body: data });
}

export function deleteLead(id) {
  return request(`/leads/${id}`, { method: "DELETE" });
}

export function addContact(leadId, data) {
  return request(`/leads/${leadId}/contacts`, { method: "POST", body: data });
}

export function updateContact(contactId, data) {
  return request(`/contacts/${contactId}`, { method: "PATCH", body: data });
}

export function deleteContact(contactId) {
  return request(`/contacts/${contactId}`, { method: "DELETE" });
}

export function listInteractions(leadId) {
  return request(`/leads/${leadId}/interactions`);
}

export function addInteraction(leadId, data) {
  return request(`/leads/${leadId}/interactions`, { method: "POST", body: data });
}

export function generateDrafts(leadId, data) {
  return request(`/leads/${leadId}/drafts`, { method: "POST", body: data });
}

export function getDashboard() {
  return request("/dashboard");
}

export async function importLeadsCsv(file) {
  const formData = new FormData();
  formData.append("file", file);
  return request("/leads/import", { method: "POST", body: formData, isForm: true });
}

export async function downloadLeadsCsv() {
  const res = await fetch("/api/leads/export", {
    headers: { Authorization: `Bearer ${localStorage.getItem("signalwork_token") || ""}` },
  });
  if (!res.ok) throw new Error("Export failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "leads-export.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function scoutSearch(query) {
  return request("/scout", { method: "POST", body: { query } });
}

export function scoutAccept(result) {
  return request("/scout/accept", { method: "POST", body: result });
}
