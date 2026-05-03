<template>
  <form @submit.prevent="handleSubmit" class="admin-form">
    <!-- Form header -->
    <div class="admin-form__header">
      <span class="admin-form__type-badge">{{ contentType.toUpperCase() }}</span>
      <h2 class="admin-form__title">
        {{ isEditing ? 'EDITAR' : 'NOVO' }} {{ contentTypeLabel }}
      </h2>
    </div>

    <!-- Status messages -->
    <div v-if="successMessage" class="admin-form__status admin-form__status--success">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="admin-form__status admin-form__status--error">
      {{ errorMessage }}
    </div>

    <!-- Loading state while fetching existing content -->
    <div v-if="loadingInitial" class="admin-form__loading">
      <span>CARREGANDO...</span>
    </div>

    <template v-else>
      <!-- ── BLOG FIELDS ── -->
      <template v-if="contentType === 'blog'">
        <div class="admin-form__field">
          <label class="admin-form__label" for="title">TÍTULO *</label>
          <input
            id="title"
            v-model="fields.title"
            type="text"
            class="admin-form__input"
            placeholder="Título do post"
            required
          />
        </div>

        <div class="admin-form__field">
          <label class="admin-form__label" for="description">DESCRIÇÃO</label>
          <input
            id="description"
            v-model="fields.description"
            type="text"
            class="admin-form__input"
            placeholder="Breve descrição do post"
          />
        </div>

        <div class="admin-form__row">
          <div class="admin-form__field">
            <label class="admin-form__label" for="date">DATA *</label>
            <input
              id="date"
              v-model="fields.date"
              type="date"
              class="admin-form__input"
              required
            />
          </div>

          <div class="admin-form__field">
            <label class="admin-form__label" for="category">CATEGORIA *</label>
            <select
              id="category"
              v-model="fields.category"
              class="admin-form__select"
              required
            >
              <option value="" disabled>Selecionar...</option>
              <option value="evento-interno">EVENTO INTERNO</option>
              <option value="evento-rua">EVENTO DE RUA</option>
              <option value="evento-coletivo">EVENTO COLETIVO</option>
            </select>
          </div>
        </div>

        <div class="admin-form__field">
          <label class="admin-form__label" for="tags">
            TAGS
            <span class="admin-form__label-hint">(separadas por vírgula)</span>
          </label>
          <input
            id="tags"
            v-model="fields.tags"
            type="text"
            class="admin-form__input"
            placeholder="techno, soundsystem, são paulo"
          />
        </div>

        <div class="admin-form__field">
          <label class="admin-form__label" for="cover">COVER (URL DA IMAGEM)</label>
          <input
            id="cover"
            v-model="fields.cover"
            type="url"
            class="admin-form__input"
            placeholder="https://..."
          />
          <div v-if="fields.cover" class="admin-form__image-preview">
            <img :src="fields.cover" alt="Cover preview" class="admin-form__preview-img" />
          </div>
        </div>

        <div class="admin-form__field admin-form__field--checkbox">
          <label class="admin-form__label admin-form__label--checkbox">
            <input
              v-model="fields.draft"
              type="checkbox"
              class="admin-form__checkbox"
            />
            <span>RASCUNHO</span>
          </label>
          <span class="admin-form__label-hint">Rascunhos não aparecem no site</span>
        </div>
      </template>

      <!-- ── EVENTS FIELDS ── -->
      <template v-else-if="contentType === 'events'">
        <div class="admin-form__field">
          <label class="admin-form__label" for="name">NOME DO EVENTO *</label>
          <input
            id="name"
            v-model="fields.name"
            type="text"
            class="admin-form__input"
            placeholder="Nome do evento"
            required
          />
        </div>

        <div class="admin-form__field">
          <label class="admin-form__label" for="description">DESCRIÇÃO</label>
          <input
            id="description"
            v-model="fields.description"
            type="text"
            class="admin-form__input"
            placeholder="Breve descrição do evento"
          />
        </div>

        <div class="admin-form__row">
          <div class="admin-form__field">
            <label class="admin-form__label" for="date">DATA *</label>
            <input
              id="date"
              v-model="fields.date"
              type="date"
              class="admin-form__input"
              required
            />
          </div>

          <div class="admin-form__field">
            <label class="admin-form__label" for="location">LOCAL</label>
            <input
              id="location"
              v-model="fields.location"
              type="text"
              class="admin-form__input"
              placeholder="Centro, São Paulo"
            />
          </div>
        </div>

        <div class="admin-form__field">
          <label class="admin-form__label" for="image">IMAGEM (URL)</label>
          <input
            id="image"
            v-model="fields.image"
            type="url"
            class="admin-form__input"
            placeholder="https://..."
          />
          <div v-if="fields.image" class="admin-form__image-preview">
            <img :src="fields.image" alt="Event image preview" class="admin-form__preview-img" />
          </div>
        </div>

        <div class="admin-form__field">
          <label class="admin-form__label" for="ticketUrl">URL DE INGRESSOS</label>
          <input
            id="ticketUrl"
            v-model="fields.ticketUrl"
            type="url"
            class="admin-form__input"
            placeholder="https://..."
          />
        </div>

        <div class="admin-form__field admin-form__field--checkbox">
          <label class="admin-form__label admin-form__label--checkbox">
            <input
              v-model="fields.draft"
              type="checkbox"
              class="admin-form__checkbox"
            />
            <span>RASCUNHO</span>
          </label>
          <span class="admin-form__label-hint">Rascunhos não aparecem no site</span>
        </div>
      </template>

      <!-- ── PODCASTS FIELDS ── -->
      <template v-else-if="contentType === 'podcasts'">
        <div class="admin-form__field">
          <label class="admin-form__label" for="title">TÍTULO *</label>
          <input
            id="title"
            v-model="fields.title"
            type="text"
            class="admin-form__input"
            placeholder="Título do episódio"
            required
          />
        </div>

        <div class="admin-form__field">
          <label class="admin-form__label" for="description">DESCRIÇÃO</label>
          <input
            id="description"
            v-model="fields.description"
            type="text"
            class="admin-form__input"
            placeholder="Breve descrição do episódio"
          />
        </div>

        <div class="admin-form__row">
          <div class="admin-form__field">
            <label class="admin-form__label" for="date">DATA *</label>
            <input
              id="date"
              v-model="fields.date"
              type="date"
              class="admin-form__input"
              required
            />
          </div>

          <div class="admin-form__field">
            <label class="admin-form__label" for="duration">DURAÇÃO</label>
            <input
              id="duration"
              v-model="fields.duration"
              type="text"
              class="admin-form__input"
              placeholder="1:32:47"
            />
          </div>
        </div>

        <div class="admin-form__field">
          <label class="admin-form__label" for="embedUrl">URL DO EMBED *</label>
          <input
            id="embedUrl"
            v-model="fields.embedUrl"
            type="url"
            class="admin-form__input"
            placeholder="https://soundcloud.com/..."
            required
          />
        </div>

        <div class="admin-form__field">
          <label class="admin-form__label" for="tags">
            TAGS
            <span class="admin-form__label-hint">(separadas por vírgula)</span>
          </label>
          <input
            id="tags"
            v-model="fields.tags"
            type="text"
            class="admin-form__input"
            placeholder="ambient, techno, brasil"
          />
        </div>

        <div class="admin-form__field admin-form__field--checkbox">
          <label class="admin-form__label admin-form__label--checkbox">
            <input
              v-model="fields.draft"
              type="checkbox"
              class="admin-form__checkbox"
            />
            <span>RASCUNHO</span>
          </label>
          <span class="admin-form__label-hint">Rascunhos não aparecem no site</span>
        </div>
      </template>

      <!-- ── BODY (shared across all types) ── -->
      <div class="admin-form__field admin-form__field--full">
        <label class="admin-form__label" for="body">
          CORPO
          <span class="admin-form__label-hint">(markdown)</span>
        </label>
        <textarea
          id="body"
          v-model="fields.body"
          class="admin-form__textarea"
          placeholder="Escreva o conteúdo em markdown..."
          rows="16"
        ></textarea>
      </div>

      <!-- ── ACTIONS ── -->
      <div class="admin-form__actions">
        <button
          type="submit"
          class="admin-form__btn admin-form__btn--submit"
          :disabled="loadingSubmit"
        >
          <span v-if="loadingSubmit" class="admin-form__btn-spinner">...</span>
          <span v-else>{{ isEditing ? 'SALVAR ALTERAÇÕES' : 'PUBLICAR' }}</span>
        </button>

        <button
          v-if="isEditing"
          type="button"
          class="admin-form__btn admin-form__btn--delete"
          :disabled="loadingDelete"
          @click="handleDelete"
        >
          <span v-if="loadingDelete" class="admin-form__btn-spinner">...</span>
          <span v-else>EXCLUIR</span>
        </button>
      </div>
    </template>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from "vue";

// ── Props ────────────────────────────────────────────────────────────────────

interface Props {
  contentType: "blog" | "events" | "podcasts";
  slug?: string;
  initialData?: Record<string, string | boolean>;
}

const props = withDefaults(defineProps<Props>(), {
  slug: undefined,
  initialData: undefined,
});

// ── State ────────────────────────────────────────────────────────────────────

const loadingInitial = ref(false);
const loadingSubmit = ref(false);
const loadingDelete = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

// Reactive field bag — holds all possible fields across content types.
// Only the fields relevant to the current contentType will be rendered.
const fields = reactive<Record<string, string | boolean>>({
  // shared
  description: "",
  date: "",
  draft: false,
  body: "",
  // blog
  title: "",
  category: "",
  tags: "",
  cover: "",
  // events
  name: "",
  location: "",
  image: "",
  ticketUrl: "",
  // podcasts
  embedUrl: "",
  duration: "",
});

// ── Computed ─────────────────────────────────────────────────────────────────

const isEditing = computed(() => Boolean(props.slug));

const contentTypeLabel = computed(() => {
  const map: Record<string, string> = {
    blog: "POST",
    events: "EVENTO",
    podcasts: "PODCAST",
  };
  return map[props.contentType] ?? props.contentType.toUpperCase();
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function clearMessages() {
  successMessage.value = "";
  errorMessage.value = "";
}

/**
 * Convert a Date or ISO string to the YYYY-MM-DD format required by <input type="date">.
 */
function toDateInputValue(value: unknown): string {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value as string);
  if (isNaN(d.getTime())) return String(value);
  return d.toISOString().slice(0, 10);
}

/**
 * Populate the reactive `fields` from a plain data object (e.g. fetched from the API
 * or passed as `initialData`). Tags arrays are joined as comma-separated strings.
 */
function applyData(data: Record<string, unknown>) {
  for (const [key, value] of Object.entries(data)) {
    if (key === "date") {
      fields.date = toDateInputValue(value);
    } else if (Array.isArray(value)) {
      // tags — join for the text input
      (fields as Record<string, unknown>)[key] = (value as string[]).join(", ");
    } else if (value !== null && value !== undefined) {
      (fields as Record<string, unknown>)[key] = value;
    }
  }
}

/**
 * Build the JSON payload to send to the API from the current field values.
 * Tags strings are split back into arrays; booleans remain booleans.
 */
function buildPayload(): Record<string, unknown> {
  const tagFields = ["tags"];
  const payload: Record<string, unknown> = {};

  // Only include fields relevant to this content type
  const relevantKeys = getRelevantKeys();
  for (const key of relevantKeys) {
    const value = fields[key];
    if (tagFields.includes(key)) {
      payload[key] = (value as string)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    } else {
      payload[key] = value;
    }
  }

  // Always include body
  payload.body = fields.body;

  // Attach slug when editing
  if (isEditing.value) {
    payload.slug = props.slug;
  }

  return payload;
}

function getRelevantKeys(): string[] {
  const shared = ["description", "date", "draft"];
  switch (props.contentType) {
    case "blog":
      return ["title", "cover", "category", "tags", ...shared];
    case "events":
      return ["name", "location", "image", "ticketUrl", ...shared];
    case "podcasts":
      return ["title", "embedUrl", "duration", "tags", ...shared];
    default:
      return shared;
  }
}

// ── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(async () => {
  // If initial data was passed directly, use it without fetching
  if (props.initialData) {
    applyData(props.initialData as Record<string, unknown>);
    return;
  }

  // If editing without initialData, fetch from API
  if (isEditing.value && props.slug) {
    loadingInitial.value = true;
    try {
      const res = await fetch(
        `/api/content/${props.contentType}?slug=${encodeURIComponent(props.slug)}`
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      applyData(data);
    } catch (err) {
      errorMessage.value =
        err instanceof Error ? err.message : "Erro ao carregar conteúdo.";
    } finally {
      loadingInitial.value = false;
    }
  }
});

// ── Event handlers ────────────────────────────────────────────────────────────

async function handleSubmit() {
  clearMessages();
  loadingSubmit.value = true;

  try {
    const payload = buildPayload();
    const method = isEditing.value ? "PUT" : "POST";

    const res = await fetch(`/api/content/${props.contentType}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error((data as { error?: string }).error || `HTTP ${res.status}`);
    }

    successMessage.value = isEditing.value
      ? "Conteúdo atualizado com sucesso."
      : `Conteúdo publicado. Slug: ${(data as { slug?: string }).slug}`;

    // Scroll to the top of the form to show success message
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    errorMessage.value =
      err instanceof Error ? err.message : "Erro ao salvar conteúdo.";
  } finally {
    loadingSubmit.value = false;
  }
}

async function handleDelete() {
  if (!props.slug) return;

  const confirmed = window.confirm(
    `Tem certeza que deseja excluir este ${contentTypeLabel.value.toLowerCase()}? Esta ação não pode ser desfeita.`
  );
  if (!confirmed) return;

  clearMessages();
  loadingDelete.value = true;

  try {
    const res = await fetch(`/api/content/${props.contentType}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: props.slug }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error((data as { error?: string }).error || `HTTP ${res.status}`);
    }

    successMessage.value = "Conteúdo excluído com sucesso.";
    // Redirect to the content list after a short delay
    setTimeout(() => {
      window.location.href = `/admin/${props.contentType}`;
    }, 1500);
  } catch (err) {
    errorMessage.value =
      err instanceof Error ? err.message : "Erro ao excluir conteúdo.";
  } finally {
    loadingDelete.value = false;
  }
}
</script>

<style scoped>
/* ── Reset / base ─────────────────────────────────────────────────────────── */
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* ── Form container ───────────────────────────────────────────────────────── */
.admin-form {
  background-color: #080808;
  color: #f0ede6;
  font-family: "New Science", monospace;
  padding: 2rem;
  max-width: 860px;
  width: 100%;
  border: 1px solid #1a1a1a;
}

/* ── Header ───────────────────────────────────────────────────────────────── */
.admin-form__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #1a1a1a;
}

.admin-form__type-badge {
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  padding: 0.2rem 0.6rem;
  border: 1px solid #444;
  color: #888;
  white-space: nowrap;
}

.admin-form__title {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #f0ede6;
  margin: 0;
}

/* ── Status messages ──────────────────────────────────────────────────────── */
.admin-form__status {
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  border-left: 3px solid;
}

.admin-form__status--success {
  border-color: #c8ff00;
  background-color: rgba(200, 255, 0, 0.05);
  color: #c8ff00;
}

.admin-form__status--error {
  border-color: #ff4444;
  background-color: rgba(255, 68, 68, 0.05);
  color: #ff4444;
}

/* ── Loading ──────────────────────────────────────────────────────────────── */
.admin-form__loading {
  padding: 3rem 0;
  text-align: center;
  font-size: 0.7rem;
  letter-spacing: 0.3em;
  color: #444;
}

/* ── Field layout ─────────────────────────────────────────────────────────── */
.admin-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.admin-form__field--full {
  width: 100%;
}

.admin-form__field--checkbox {
  flex-direction: column;
  align-items: flex-start;
}

.admin-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 600px) {
  .admin-form__row {
    grid-template-columns: 1fr;
  }
}

/* ── Labels ───────────────────────────────────────────────────────────────── */
.admin-form__label {
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #888;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.admin-form__label--checkbox {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  color: #f0ede6;
}

.admin-form__label-hint {
  font-size: 0.6rem;
  color: #444;
  letter-spacing: 0.1em;
  text-transform: none;
}

/* ── Inputs ───────────────────────────────────────────────────────────────── */
.admin-form__input,
.admin-form__select,
.admin-form__textarea {
  background-color: #111;
  border: 1px solid #2a2a2a;
  color: #f0ede6;
  font-family: "New Science", monospace;
  font-size: 0.8rem;
  padding: 0.65rem 0.75rem;
  width: 100%;
  outline: none;
  transition: border-color 0.15s ease;
  appearance: none;
  -webkit-appearance: none;
}

.admin-form__input:focus,
.admin-form__select:focus,
.admin-form__textarea:focus {
  border-color: #c8ff00;
}

.admin-form__input::placeholder,
.admin-form__textarea::placeholder {
  color: #333;
}

.admin-form__select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23666' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2.25rem;
  cursor: pointer;
}

.admin-form__select option {
  background-color: #111;
  color: #f0ede6;
}

.admin-form__textarea {
  resize: vertical;
  line-height: 1.6;
  min-height: 220px;
}

/* ── Checkbox ─────────────────────────────────────────────────────────────── */
.admin-form__checkbox {
  appearance: none;
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border: 1px solid #2a2a2a;
  background-color: #111;
  flex-shrink: 0;
  cursor: pointer;
  position: relative;
  transition: border-color 0.15s ease;
}

.admin-form__checkbox:checked {
  background-color: #c8ff00;
  border-color: #c8ff00;
}

.admin-form__checkbox:checked::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 5px;
  width: 4px;
  height: 8px;
  border: 2px solid #080808;
  border-top: none;
  border-left: none;
  transform: rotate(45deg);
}

.admin-form__checkbox:focus {
  border-color: #c8ff00;
  outline: none;
}

/* ── Image preview ────────────────────────────────────────────────────────── */
.admin-form__image-preview {
  margin-top: 0.5rem;
  border: 1px solid #1a1a1a;
  overflow: hidden;
  max-width: 320px;
}

.admin-form__preview-img {
  display: block;
  width: 100%;
  height: auto;
  max-height: 160px;
  object-fit: cover;
  filter: grayscale(20%);
}

/* ── Actions ──────────────────────────────────────────────────────────────── */
.admin-form__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #1a1a1a;
}

.admin-form__btn {
  font-family: "New Science", monospace;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 0.75rem 1.75rem;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s ease, background-color 0.15s ease;
  min-width: 140px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.admin-form__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.admin-form__btn--submit {
  background-color: #c8ff00;
  color: #080808;
}

.admin-form__btn--submit:not(:disabled):hover {
  background-color: #d4ff33;
}

.admin-form__btn--delete {
  background-color: transparent;
  border: 1px solid #ff4444;
  color: #ff4444;
}

.admin-form__btn--delete:not(:disabled):hover {
  background-color: rgba(255, 68, 68, 0.08);
}

.admin-form__btn-spinner {
  letter-spacing: 0.1em;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
