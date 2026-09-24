import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ArrowUp, ArrowDown, ArrowUpRight } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import type {
  ExperienceContent,
  HomepageSection,
  PortfolioSnapshot,
  ProfileFormValues,
  ProjectFormValues,
  ServiceFormValues,
  SkillFormValues,
} from "@shared/portfolio";

type EditableProfile = ProfileFormValues & { id: number };

type ProjectAdminRecord = ProjectFormValues & { id: number; tags: string[] };

type SkillAdminRecord = SkillFormValues & { id: number; items: string[] };

const emptyProject = (): ProjectFormValues => ({
  title: "",
  description: "",
  tagsText: "",
  githubUrl: "",
  liveUrl: "",
  isPublished: true,
  displayOrder: 1,
});

const emptySkill = (): SkillFormValues => ({
  category: "",
  itemsText: "",
  isVisible: true,
  displayOrder: 1,
});

const emptyService = (): ServiceFormValues => ({
  title: "",
  description: "",
  isVisible: true,
  displayOrder: 1,
});

const emptyExperience = (): Omit<ExperienceContent, "id"> => ({
  role: "",
  company: "",
  dates: "",
  description: "",
  isVisible: true,
  displayOrder: 1,
});

/** A consistent label + input wrapper keeps the admin forms beginner-friendly. */
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="admin-field">
      <span className="admin-label">{label}</span>
      {hint && <span className="admin-hint">{hint}</span>}
      {children}
    </label>
  );
}

function VisibilityField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="admin-check">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function EditorHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="admin-page-header">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <a className="admin-view-link flex items-center gap-1.5" href="/">
        <span>View public site</span>
        <ArrowUpRight className="w-4 h-4" />
      </a>
    </div>
  );
}

function Notice({ message }: { message: string }) {
  if (!message) return null;
  return <p className={`admin-notice ${message.startsWith("Could") || message.startsWith("Please") ? "error" : "success"}`} role="status">{message}</p>;
}

/**
 * Edits the one profile record. `onSaved` refreshes both admin and public content after a successful save.
 */
function ProfileEditor({ profile, onSaved }: { profile: EditableProfile; onSaved: () => void }) {
  const [form, setForm] = useState(profile);
  const [notice, setNotice] = useState("");
  const saveProfile = trpc.portfolio.admin.saveProfile.useMutation({
    onSuccess: () => { setNotice("Profile saved."); onSaved(); },
    onError: (error) => setNotice(`Could not save profile: ${error.message}`),
  });

  useEffect(() => setForm(profile), [profile]);

  function updateField(field: keyof ProfileFormValues, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    saveProfile.mutate({
      id: profile.id,
      initials: form.initials,
      name: form.name,
      heroTag: form.heroTag,
      heroFirstName: form.heroFirstName,
      heroHighlightName: form.heroHighlightName,
      heroLastName: form.heroLastName,
      subtitle: form.subtitle,
      heroDescription: form.heroDescription,
      profileImageUrl: form.profileImageUrl,
      profileImageAlt: form.profileImageAlt,
      aboutIntro: form.aboutIntro,
      aboutDescription: form.aboutDescription,
      contactHeading: form.contactHeading,
      contactText: form.contactText,
      footerTagline: form.footerTagline,
      socialLinks: { github: form.github, linkedin: form.linkedin, twitter: form.twitter, email: form.email },
    });
  }

  return (
    <Card className="admin-card">
      <CardHeader><CardTitle>Profile and site text</CardTitle></CardHeader>
      <CardContent>
        <form className="admin-form" onSubmit={submit}>
          <div className="admin-form-grid">
            <Field label="Short initials" hint="Shown in the logo and footer."><Input value={form.initials} onChange={(event) => updateField("initials", event.target.value)} required /></Field>
            <Field label="Full name"><Input value={form.name} onChange={(event) => updateField("name", event.target.value)} required /></Field>
            <Field label="Hero tag"><Input value={form.heroTag} onChange={(event) => updateField("heroTag", event.target.value)} required /></Field>
            <Field label="Hero first line"><Input value={form.heroFirstName} onChange={(event) => updateField("heroFirstName", event.target.value)} required /></Field>
            <Field label="Hero highlighted line"><Input value={form.heroHighlightName} onChange={(event) => updateField("heroHighlightName", event.target.value)} required /></Field>
            <Field label="Hero last line"><Input value={form.heroLastName} onChange={(event) => updateField("heroLastName", event.target.value)} required /></Field>
            <Field label="Subtitle"><Input value={form.subtitle} onChange={(event) => updateField("subtitle", event.target.value)} required /></Field>
            <Field label="Profile image URL" hint="Use an uploaded image URL."><Input value={form.profileImageUrl} onChange={(event) => updateField("profileImageUrl", event.target.value)} /></Field>
            <Field label="Profile image alt text"><Input value={form.profileImageAlt} onChange={(event) => updateField("profileImageAlt", event.target.value)} required /></Field>
            <Field label="GitHub URL"><Input value={form.github} onChange={(event) => updateField("github", event.target.value)} /></Field>
            <Field label="LinkedIn URL"><Input value={form.linkedin} onChange={(event) => updateField("linkedin", event.target.value)} /></Field>
            <Field label="Twitter / X URL"><Input value={form.twitter} onChange={(event) => updateField("twitter", event.target.value)} /></Field>
            <Field label="Email address"><Input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} /></Field>
          </div>
          <Field label="Hero description"><Textarea value={form.heroDescription} onChange={(event) => updateField("heroDescription", event.target.value)} required /></Field>
          <Field label="About introduction"><Textarea value={form.aboutIntro} onChange={(event) => updateField("aboutIntro", event.target.value)} required /></Field>
          <Field label="About description"><Textarea value={form.aboutDescription} onChange={(event) => updateField("aboutDescription", event.target.value)} required /></Field>
          <Field label="Contact heading"><Input value={form.contactHeading} onChange={(event) => updateField("contactHeading", event.target.value)} required /></Field>
          <Field label="Contact text"><Textarea value={form.contactText} onChange={(event) => updateField("contactText", event.target.value)} required /></Field>
          <Field label="Footer tagline"><Input value={form.footerTagline} onChange={(event) => updateField("footerTagline", event.target.value)} /></Field>
          <div className="admin-actions"><Button type="submit" disabled={saveProfile.isPending}>{saveProfile.isPending ? "Saving…" : "Save profile"}</Button></div>
          <Notice message={notice} />
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * Handles both creating and editing a project. An optional `id` tells us whether this is an update.
 */
function ProjectEditor({ project, onDone }: { project: ProjectFormValues & { id?: number }; onDone: () => void }) {
  const [form, setForm] = useState(project);
  const [notice, setNotice] = useState("");
  const utils = trpc.useUtils();
  const createProject = trpc.portfolio.admin.projects.create.useMutation({ onSuccess: () => { setNotice("Project added. You can close this form when ready."); void utils.portfolio.admin.get.invalidate(); void utils.portfolio.get.invalidate(); }, onError: (error) => setNotice(`Could not save project: ${error.message}`) });
  const updateProject = trpc.portfolio.admin.projects.update.useMutation({ onSuccess: () => { setNotice("Project updated."); void utils.portfolio.admin.get.invalidate(); void utils.portfolio.get.invalidate(); }, onError: (error) => setNotice(`Could not save project: ${error.message}`) });
  const isSaving = createProject.isPending || updateProject.isPending;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = { title: form.title, description: form.description, tags: form.tagsText.split(",").map((tag) => tag.trim()).filter(Boolean), githubUrl: form.githubUrl, liveUrl: form.liveUrl, isPublished: form.isPublished, displayOrder: Number(form.displayOrder) || 0 };
    if (!input.title.trim() || !input.description.trim()) { setNotice("Please add a title and description."); return; }
    if (form.id) updateProject.mutate({ id: form.id, ...input }); else createProject.mutate(input);
  }

  return <form className="admin-form admin-editor-form" onSubmit={submit}>
    <div className="admin-form-grid"><Field label="Project title"><Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></Field><Field label="Display order"><Input type="number" min="0" value={form.displayOrder} onChange={(event) => setForm({ ...form, displayOrder: Number(event.target.value) })} /></Field></div>
    <Field label="Description"><Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required /></Field>
    <Field label="Technologies" hint="Separate each technology with a comma."><Input value={form.tagsText} onChange={(event) => setForm({ ...form, tagsText: event.target.value })} /></Field>
    <div className="admin-form-grid"><Field label="GitHub URL"><Input value={form.githubUrl} onChange={(event) => setForm({ ...form, githubUrl: event.target.value })} /></Field><Field label="Live demo URL"><Input value={form.liveUrl} onChange={(event) => setForm({ ...form, liveUrl: event.target.value })} /></Field></div>
    <VisibilityField label="Show this project publicly" checked={form.isPublished} onChange={(value) => setForm({ ...form, isPublished: value })} />
    <div className="admin-actions"><Button type="submit" disabled={isSaving}>{isSaving ? "Saving…" : form.id ? "Update project" : "Add project"}</Button><Button type="button" variant="outline" onClick={onDone}>Cancel</Button></div><Notice message={notice} />
  </form>;
}

/** The projects list owns which project is being edited and asks the parent to refresh after changes. */
function ProjectsEditor({ projects, onChanged }: { projects: ProjectAdminRecord[]; onChanged: () => void }) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState("");
  const utils = trpc.useUtils();
  const deleteProject = trpc.portfolio.admin.projects.delete.useMutation({ onSuccess: () => { setNotice("Project deleted."); onChanged(); void utils.portfolio.get.invalidate(); }, onError: (error) => setNotice(`Could not delete project: ${error.message}`) });

  function removeProject(id: number) {
    if (window.confirm("Delete this project? This cannot be undone.")) deleteProject.mutate({ id });
  }

  return <Card className="admin-card"><CardHeader><div className="admin-card-title-row"><CardTitle>Projects</CardTitle><Button onClick={() => { setAdding(true); setEditingId(null); }}>Add project</Button></div></CardHeader><CardContent>
    {(adding || editingId !== null) && <ProjectEditor project={adding ? emptyProject() : { ...projects.find((project) => project.id === editingId)!, tagsText: projects.find((project) => project.id === editingId)!.tags.join(", ") }} onDone={() => { setAdding(false); setEditingId(null); onChanged(); }} />}
    <div className="admin-list">{projects.length === 0 && <p className="admin-empty">No projects yet. Use “Add project” to create the first one.</p>}{projects.map((project) => <div className="admin-list-row" key={project.id}><div><strong>{project.title}</strong><span className={`admin-status ${project.isPublished ? "published" : "hidden"}`}>{project.isPublished ? "Published" : "Hidden"}</span><p>{project.description}</p></div><div className="admin-row-actions"><Button size="sm" variant="outline" onClick={() => { setEditingId(project.id); setAdding(false); }}>Edit</Button><Button size="sm" variant="destructive" onClick={() => removeProject(project.id)}>Delete</Button></div></div>)}</div>
    <Notice message={notice} />
  </CardContent></Card>;
}

/** Skills are stored as an array of plain text items, while the form uses one comma-separated input. */
function SkillsEditor({ skills, onChanged }: { skills: SkillAdminRecord[]; onChanged: () => void }) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState("");
  const utils = trpc.useUtils();
  const deleteSkill = trpc.portfolio.admin.skills.delete.useMutation({ onSuccess: () => { setNotice("Skill group deleted."); onChanged(); void utils.portfolio.get.invalidate(); }, onError: (error) => setNotice(`Could not delete skill group: ${error.message}`) });
  const createSkill = trpc.portfolio.admin.skills.create.useMutation({ onSuccess: () => { setNotice("Skill group added."); setAdding(false); onChanged(); void utils.portfolio.get.invalidate(); }, onError: (error) => setNotice(`Could not save skill group: ${error.message}`) });
  const updateSkill = trpc.portfolio.admin.skills.update.useMutation({ onSuccess: () => { setNotice("Skill group updated."); setEditingId(null); onChanged(); void utils.portfolio.get.invalidate(); }, onError: (error) => setNotice(`Could not save skill group: ${error.message}`) });

  /** Convert the beginner-friendly comma-separated input into the array stored by the API. */
  function save(form: SkillFormValues, id?: number) {
    const input = { category: form.category, items: form.itemsText.split(",").map((item) => item.trim()).filter(Boolean), isVisible: form.isVisible, displayOrder: Number(form.displayOrder) || 0 };
    if (!input.category) return;
    if (id) updateSkill.mutate({ id, ...input }); else createSkill.mutate(input);
  }

  return <Card className="admin-card"><CardHeader><div className="admin-card-title-row"><CardTitle>Skills</CardTitle><Button onClick={() => setAdding(true)}>Add skill group</Button></div></CardHeader><CardContent>
    {adding && <SimpleEditor title="New skill group" submitLabel="Add skill group" onCancel={() => setAdding(false)} onSubmit={(form) => save(form)} initial={emptySkill()} />}
    <div className="admin-list">{skills.length === 0 && <p className="admin-empty">No skill groups yet. Use “Add skill group” to create one.</p>}{skills.map((skill) => editingId === skill.id ? <SimpleEditor key={skill.id} title={`Edit ${skill.category}`} submitLabel="Save skill group" onCancel={() => setEditingId(null)} onSubmit={(form) => save(form, skill.id)} initial={{ ...skill, itemsText: skill.items.join(", ") }} /> : <div className="admin-list-row" key={skill.id}><div><strong>{skill.category}</strong><span className={`admin-status ${skill.isVisible ? "published" : "hidden"}`}>{skill.isVisible ? "Visible" : "Hidden"}</span><p>{skill.items.join(" · ")}</p></div><div className="admin-row-actions"><Button size="sm" variant="outline" onClick={() => setEditingId(skill.id)}>Edit</Button><Button size="sm" variant="destructive" onClick={() => { if (window.confirm("Delete this skill group?")) deleteSkill.mutate({ id: skill.id }); }}>Delete</Button></div></div>)}</div>
    <Notice message={notice} />
  </CardContent></Card>;
}

/** Small reusable editor for a skill group; the parent decides whether the submit is create or update. */
function SimpleEditor({ title, submitLabel, initial, onCancel, onSubmit }: { title: string; submitLabel: string; initial: SkillFormValues; onCancel: () => void; onSubmit: (form: SkillFormValues) => void }) {
  const [form, setForm] = useState(initial);
  return <form className="admin-form admin-inline-editor" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}><h3>{title}</h3><div className="admin-form-grid"><Field label="Category"><Input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required /></Field><Field label="Display order"><Input type="number" min="0" value={form.displayOrder} onChange={(event) => setForm({ ...form, displayOrder: Number(event.target.value) })} /></Field></div><Field label="Skills" hint="Separate each skill with a comma."><Input value={form.itemsText} onChange={(event) => setForm({ ...form, itemsText: event.target.value })} /></Field><VisibilityField label="Show this group publicly" checked={form.isVisible} onChange={(value) => setForm({ ...form, isVisible: value })} /><div className="admin-actions"><Button type="submit">{submitLabel}</Button><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button></div></form>;
}

/** Services use the same simple CRUD pattern as projects but have no external links. */
function ServicesEditor({ services, onChanged }: { services: Array<ServiceFormValues & { id: number }>; onChanged: () => void }) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState("");
  const utils = trpc.useUtils();
  const createService = trpc.portfolio.admin.services.create.useMutation({ onSuccess: () => { setNotice("Service added."); setAdding(false); onChanged(); void utils.portfolio.get.invalidate(); }, onError: (error) => setNotice(`Could not save service: ${error.message}`) });
  const updateService = trpc.portfolio.admin.services.update.useMutation({ onSuccess: () => { setNotice("Service updated."); setEditingId(null); onChanged(); void utils.portfolio.get.invalidate(); }, onError: (error) => setNotice(`Could not save service: ${error.message}`) });
  const deleteService = trpc.portfolio.admin.services.delete.useMutation({ onSuccess: () => { setNotice("Service deleted."); onChanged(); void utils.portfolio.get.invalidate(); }, onError: (error) => setNotice(`Could not delete service: ${error.message}`) });
  /** The optional id distinguishes a new service from an existing service. */
  function save(form: ServiceFormValues, id?: number) { const input = { ...form, displayOrder: Number(form.displayOrder) || 0 }; if (id) updateService.mutate({ id, ...input }); else createService.mutate(input); }
  return <Card className="admin-card"><CardHeader><div className="admin-card-title-row"><CardTitle>Services</CardTitle><Button onClick={() => setAdding(true)}>Add service</Button></div></CardHeader><CardContent>{services.length === 0 && !adding && <p className="admin-empty">No services yet. Use “Add service” to create one.</p>}{adding && <ServiceForm initial={emptyService()} onCancel={() => setAdding(false)} onSubmit={(form) => save(form)} submitLabel="Add service" />}{services.map((service) => editingId === service.id ? <ServiceForm key={service.id} initial={service} onCancel={() => setEditingId(null)} onSubmit={(form) => save(form, service.id)} submitLabel="Save service" /> : <div className="admin-list-row" key={service.id}><div><strong>{service.title}</strong><span className={`admin-status ${service.isVisible ? "published" : "hidden"}`}>{service.isVisible ? "Visible" : "Hidden"}</span><p>{service.description}</p></div><div className="admin-row-actions"><Button size="sm" variant="outline" onClick={() => setEditingId(service.id)}>Edit</Button><Button size="sm" variant="destructive" onClick={() => { if (window.confirm("Delete this service?")) deleteService.mutate({ id: service.id }); }}>Delete</Button></div></div>)}<Notice message={notice} /></CardContent></Card>;
}

/** Form props are kept small: initial values, button text, and callbacks for save/cancel. */
function ServiceForm({ initial, onCancel, onSubmit, submitLabel }: { initial: ServiceFormValues; onCancel: () => void; onSubmit: (form: ServiceFormValues) => void; submitLabel: string }) {
  const [form, setForm] = useState(initial);
  return <form className="admin-form admin-inline-editor" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}><Field label="Service title"><Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></Field><Field label="Description"><Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required /></Field><div className="admin-form-grid"><Field label="Display order"><Input type="number" min="0" value={form.displayOrder} onChange={(event) => setForm({ ...form, displayOrder: Number(event.target.value) })} /></Field><VisibilityField label="Show this service publicly" checked={form.isVisible} onChange={(value) => setForm({ ...form, isVisible: value })} /></div><div className="admin-actions"><Button type="submit">{submitLabel}</Button><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button></div></form>;
}

/** Experience entries are optional; an empty list is valid until the owner adds the first one. */
function ExperienceEditor({ experiences, onChanged }: { experiences: Array<ExperienceContent>; onChanged: () => void }) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState("");
  const utils = trpc.useUtils();
  const createExperience = trpc.portfolio.admin.experience.create.useMutation({ onSuccess: () => { setNotice("Experience added."); setAdding(false); onChanged(); void utils.portfolio.get.invalidate(); }, onError: (error) => setNotice(`Could not save experience: ${error.message}`) });
  const updateExperience = trpc.portfolio.admin.experience.update.useMutation({ onSuccess: () => { setNotice("Experience updated."); setEditingId(null); onChanged(); void utils.portfolio.get.invalidate(); }, onError: (error) => setNotice(`Could not save experience: ${error.message}`) });
  const deleteExperience = trpc.portfolio.admin.experience.delete.useMutation({ onSuccess: () => { setNotice("Experience deleted."); onChanged(); void utils.portfolio.get.invalidate(); }, onError: (error) => setNotice(`Could not delete experience: ${error.message}`) });
  /** The optional id distinguishes a new experience entry from an existing entry. */
  function save(form: Omit<ExperienceContent, "id">, id?: number) { const input = { ...form, displayOrder: Number(form.displayOrder) || 0 }; if (id) updateExperience.mutate({ id, ...input }); else createExperience.mutate(input); }
  return <Card className="admin-card"><CardHeader><div className="admin-card-title-row"><CardTitle>Experience</CardTitle><Button onClick={() => setAdding(true)}>Add experience</Button></div></CardHeader><CardContent>{experiences.length === 0 && !adding && <p className="admin-empty">No experience entries yet. Use “Add experience” to create one.</p>}{adding && <ExperienceForm initial={emptyExperience()} onCancel={() => setAdding(false)} onSubmit={(form) => save(form)} submitLabel="Add experience" />}{experiences.map((experience) => editingId === experience.id ? <ExperienceForm key={experience.id} initial={experience} onCancel={() => setEditingId(null)} onSubmit={(form) => save(form, experience.id)} submitLabel="Save experience" /> : <div className="admin-list-row" key={experience.id}><div><strong>{experience.role} · {experience.company}</strong><span className={`admin-status ${experience.isVisible ? "published" : "hidden"}`}>{experience.isVisible ? "Visible" : "Hidden"}</span><p>{experience.dates} — {experience.description}</p></div><div className="admin-row-actions"><Button size="sm" variant="outline" onClick={() => setEditingId(experience.id)}>Edit</Button><Button size="sm" variant="destructive" onClick={() => { if (window.confirm("Delete this experience?")) deleteExperience.mutate({ id: experience.id }); }}>Delete</Button></div></div>)}<Notice message={notice} /></CardContent></Card>;
}

/** The form intentionally uses a text date range so the owner can write dates naturally. */
function ExperienceForm({ initial, onCancel, onSubmit, submitLabel }: { initial: Omit<ExperienceContent, "id">; onCancel: () => void; onSubmit: (form: Omit<ExperienceContent, "id">) => void; submitLabel: string }) {
  const [form, setForm] = useState(initial);
  return <form className="admin-form admin-inline-editor" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}><div className="admin-form-grid"><Field label="Role"><Input value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} required /></Field><Field label="Company"><Input value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} required /></Field><Field label="Dates"><Input value={form.dates} onChange={(event) => setForm({ ...form, dates: event.target.value })} placeholder="2024 – Present" required /></Field><Field label="Display order"><Input type="number" min="0" value={form.displayOrder} onChange={(event) => setForm({ ...form, displayOrder: Number(event.target.value) })} /></Field></div><Field label="Description"><Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required /></Field><VisibilityField label="Show this experience publicly" checked={form.isVisible} onChange={(value) => setForm({ ...form, isVisible: value })} /><div className="admin-actions"><Button type="submit">{submitLabel}</Button><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button></div></form>;
}

/**
 * Shows the fixed set of homepage sections. The editor changes only heading, visibility, and order.
 */
function HomepageSectionsEditor({ sections, onChanged }: { sections: HomepageSection[]; onChanged: () => void }) {
  const [draft, setDraft] = useState(sections);
  const [notice, setNotice] = useState("");
  const saveSections = trpc.portfolio.admin.sections.update.useMutation({ onSuccess: () => { setNotice("Homepage settings saved."); onChanged(); }, onError: (error) => setNotice(`Could not save homepage settings: ${error.message}`) });
  useEffect(() => setDraft(sections), [sections]);

  function move(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= draft.length) return;
    const next = [...draft];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setDraft(next.map((section, order) => ({ ...section, displayOrder: order + 1 })));
  }

  return (
    <Card className="admin-card">
      <CardHeader>
        <CardTitle>Homepage sections</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="admin-card-description">
          Hide a section or move it up and down. This keeps the current design without adding a complicated page builder.
        </p>
        <div className="section-order-list">
          {draft.map((section, index) => (
            <div className="section-order-row" key={section.id}>
              <div className="section-order-details">
                <strong>{section.label}</strong>
                <span className="admin-hint">/{section.sectionKey}</span>
                <input
                  className="section-heading-input"
                  aria-label={`${section.label} heading`}
                  value={section.heading}
                  onChange={(event) =>
                    setDraft(
                      draft.map((item) =>
                        item.id === section.id
                          ? { ...item, heading: event.target.value }
                          : item
                      )
                    )
                  }
                />
              </div>
              <div className="section-order-actions">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Move Up"
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => move(index, 1)}
                  disabled={index === draft.length - 1}
                  aria-label="Move Down"
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
                <VisibilityField
                  label={section.isVisible ? "Visible" : "Hidden"}
                  checked={section.isVisible}
                  onChange={(value) =>
                    setDraft(
                      draft.map((item) =>
                        item.id === section.id
                          ? { ...item, isVisible: value }
                          : item
                      )
                    )
                  }
                />
              </div>
            </div>
          ))}
        </div>
        <div className="admin-actions">
          <Button
            onClick={() => saveSections.mutate({ sections: draft })}
            disabled={saveSections.isPending}
          >
            {saveSections.isPending ? "Saving..." : "Save homepage order"}
          </Button>
        </div>
        <Notice message={notice} />
      </CardContent>
    </Card>
  );
}

function AdminOverview({ portfolio }: { portfolio: PortfolioSnapshot }) {
  return <><EditorHeader title="Portfolio admin" description="Make small content changes without editing the public React components." /><div className="admin-stat-grid"><Card className="admin-stat"><CardContent><span>Projects</span><strong>{portfolio.projects.length}</strong></CardContent></Card><Card className="admin-stat"><CardContent><span>Visible projects</span><strong>{portfolio.projects.filter((project) => project.isPublished).length}</strong></CardContent></Card><Card className="admin-stat"><CardContent><span>Skills groups</span><strong>{portfolio.skills.length}</strong></CardContent></Card><Card className="admin-stat"><CardContent><span>Services</span><strong>{portfolio.services.length}</strong></CardContent></Card></div><Card className="admin-card admin-welcome"><CardContent><h2>Simple editing, same portfolio</h2><p>Use the sidebar to update the profile, projects, or other content. Changes are stored securely and only visible publicly when an item is marked visible or published.</p></CardContent></Card></>;
}

export default function AdminPage() {
  const [location] = useLocation();
  const { user } = useAuth();
  const tab = useMemo(() => {
    const queryString = location.includes("?")
      ? location.split("?")[1]
      : typeof window !== "undefined"
        ? window.location.search.slice(1)
        : "";
    return new URLSearchParams(queryString).get("tab") ?? "overview";
  }, [location]);
  const isAdmin = user?.role === "admin";
  const portfolioQuery = trpc.portfolio.admin.get.useQuery(undefined, { enabled: isAdmin });
  const utils = trpc.useUtils();
  const portfolio = portfolioQuery.data;

  function refreshContent() {
    void utils.portfolio.admin.get.invalidate();
    void utils.portfolio.get.invalidate();
  }

  if (!isAdmin) {
    return <div className="admin-forbidden"><h1>Owner access required</h1><p>This page is private. Sign in with the owner account to manage the portfolio.</p></div>;
  }
  if (portfolioQuery.isLoading || !portfolio) return <div className="admin-loading">Loading your portfolio content…</div>;
  if (portfolioQuery.error) return <div className="admin-forbidden"><h1>Could not load content</h1><p>{portfolioQuery.error.message}</p></div>;

  const profile: EditableProfile = {
    ...portfolio.profile,
    github: portfolio.profile.socialLinks.github,
    linkedin: portfolio.profile.socialLinks.linkedin,
    twitter: portfolio.profile.socialLinks.twitter,
    email: portfolio.profile.socialLinks.email,
  };
  const projects: ProjectAdminRecord[] = portfolio.projects.map((project) => ({ ...project, tagsText: project.tags.join(", ") }));
  const skills: SkillAdminRecord[] = portfolio.skills.map((skill) => ({ ...skill, itemsText: skill.items.join(", ") }));

  return <div className="admin-page">
    {tab === "overview" && <AdminOverview portfolio={portfolio} />}
    {tab === "profile" && <><EditorHeader title="Profile" description="Update the text and links used around your public portfolio." /><ProfileEditor profile={profile} onSaved={refreshContent} /></>}
    {tab === "projects" && <><EditorHeader title="Projects" description="Add, edit, hide, reorder, or delete the work you want to show." /><ProjectsEditor projects={projects} onChanged={refreshContent} /></>}
    {tab === "content" && <><EditorHeader title="Content" description="Manage the supporting content and the order of your homepage sections." /><HomepageSectionsEditor sections={portfolio.homepageSections} onChanged={refreshContent} /><SkillsEditor skills={skills} onChanged={refreshContent} /><ServicesEditor services={portfolio.services} onChanged={refreshContent} /><ExperienceEditor experiences={portfolio.experiences} onChanged={refreshContent} /></>}
  </div>;
}
