<script setup lang="ts">
import { ref, computed } from "vue";

interface Event {
  slug: string;
  name: string;
  date: string;
  image?: string;
  location?: string;
  description?: string;
}

const props = defineProps<{
  events: Event[];
}>();

const selectedYear = ref<number | null>(null);
const nowMs = Date.now();

// Parse each date string once — reused by all downstream computeds.
const parsedEvents = computed(() =>
  props.events.map((e) => {
    const d = new Date(e.date);
    return { ...e, _ms: d.valueOf(), _year: d.getFullYear() };
  })
);

const years = computed(() => {
  const ys = parsedEvents.value.map((e) => e._year);
  return [...new Set(ys)].sort((a, b) => b - a);
});

const filtered = computed(() => {
  if (selectedYear.value === null) return parsedEvents.value;
  return parsedEvents.value.filter((e) => e._year === selectedYear.value);
});

const upcoming = computed(() =>
  filtered.value
    .filter((e) => e._ms > nowMs)
    .sort((a, b) => a._ms - b._ms)
);

const past = computed(() =>
  filtered.value
    .filter((e) => e._ms <= nowMs)
    .sort((a, b) => b._ms - a._ms)
);

function formatDay(dateStr: string) {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}`;
}

function formatYear(dateStr: string) {
  return new Date(dateStr).getFullYear();
}
</script>

<template>
  <div class="date-filter">
    <!-- Year filter -->
    <div class="filter-bar" role="group" aria-label="Filtrar por ano">
      <button
        :class="['filter-btn', selectedYear === null ? 'active' : '']"
        @click="() => { selectedYear = null; }"
      >
        TODOS
      </button>
      <button
        v-for="year in years"
        :key="year"
        :class="['filter-btn', selectedYear === year ? 'active' : '']"
        @click="() => { selectedYear = year; }"
      >
        {{ year }}
      </button>
    </div>

    <!-- Upcoming events -->
    <section v-if="upcoming.length > 0" class="section">
      <div class="section-label upcoming-label">PRÓXIMOS</div>
      <div class="timeline">
        <a
          v-for="event in upcoming"
          :key="event.slug"
          :href="`/events/${event.slug}`"
          class="timeline-item upcoming"
        >
          <div class="date-stamp" aria-hidden="true">{{ formatDay(event.date) }}</div>
          <div class="event-details">
            <span class="event-year">{{ formatYear(event.date) }}</span>
            <h3 class="event-name">{{ event.name }}</h3>
            <p v-if="event.location" class="event-location">→ {{ event.location }}</p>
            <p v-if="event.description" class="event-desc">{{ event.description }}</p>
          </div>
        </a>
      </div>
    </section>

    <!-- Past events -->
    <section v-if="past.length > 0" class="section past-section">
      <div class="section-label past-label">PASSADOS</div>
      <div class="timeline">
        <a
          v-for="event in past"
          :key="event.slug"
          :href="`/events/${event.slug}`"
          class="timeline-item past"
        >
          <div class="date-stamp" aria-hidden="true">{{ formatDay(event.date) }}</div>
          <div class="event-details">
            <span class="event-year muted">{{ formatYear(event.date) }}</span>
            <h3 class="event-name muted">{{ event.name }}</h3>
            <p v-if="event.location" class="event-location muted">→ {{ event.location }}</p>
            <p v-if="event.description" class="event-desc muted">{{ event.description }}</p>
          </div>
        </a>
      </div>
    </section>

    <!-- Empty state -->
    <div v-if="upcoming.length === 0 && past.length === 0" class="empty">
      <p>Nenhum evento encontrado.</p>
    </div>
  </div>
</template>

<style scoped>
.date-filter {
  color: #F0EDE6;
}

/* Filter bar */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 3rem;
}

.filter-btn {
  font-family: "Space Mono", "Courier New", monospace;
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 0.4rem 1rem;
  border: 1px solid #444444;
  background: transparent;
  color: #444444;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  border-color: #C8FF00;
  color: #C8FF00;
}

.filter-btn.active {
  background: #C8FF00;
  border-color: #C8FF00;
  color: #080808;
}

/* Section labels */
.section {
  margin-bottom: 4rem;
}

.section-label {
  font-family: "Space Mono", "Courier New", monospace;
  font-size: 0.65rem;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
}

.upcoming-label {
  color: #C8FF00;
  border-bottom: 1px solid #C8FF00;
}

.past-section {
  opacity: 0.7;
}

.past-label {
  color: #444444;
  border-bottom: 1px solid #444444;
}

/* Timeline */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline-item {
  display: grid;
  grid-template-columns: 7rem 1fr;
  gap: 2rem;
  padding: 1.75rem 0;
  border-bottom: 1px solid rgba(68, 68, 68, 0.3);
  text-decoration: none;
  color: inherit;
  transition: background 0.15s ease;
  align-items: start;
}

.timeline-item:hover {
  background: rgba(200, 255, 0, 0.03);
}

.timeline-item.upcoming {
  border-left: 3px solid #C8FF00;
  padding-left: 1.5rem;
}

.timeline-item.past {
  border-left: 3px solid transparent;
  padding-left: 1.5rem;
}

.date-stamp {
  font-family: "Space Mono", "Courier New", monospace;
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 700;
  line-height: 1;
  color: #C8FF00;
  white-space: nowrap;
  padding-top: 0.2rem;
}

.timeline-item.past .date-stamp {
  color: #444444;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.event-year {
  font-family: "Space Mono", "Courier New", monospace;
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  color: #444444;
  text-transform: uppercase;
}

.event-name {
  font-family: "Syne", system-ui, sans-serif;
  font-size: clamp(1.1rem, 2.5vw, 1.5rem);
  font-weight: 700;
  color: #F0EDE6;
  line-height: 1.15;
  margin: 0;
  transition: color 0.2s ease;
}

.timeline-item:hover .event-name {
  color: #C8FF00;
}

.event-name.muted {
  color: #888888;
}

.event-location {
  font-family: "Space Mono", "Courier New", monospace;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  color: #888888;
  margin: 0;
}

.event-desc {
  font-family: "Barlow Condensed", system-ui, sans-serif;
  font-size: 0.875rem;
  color: #888888;
  margin: 0;
  margin-top: 0.25rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-year.muted,
.event-location.muted,
.event-desc.muted {
  color: #555555;
}

/* Empty state */
.empty {
  font-family: "Space Mono", "Courier New", monospace;
  font-size: 0.8rem;
  color: #444444;
  letter-spacing: 0.1em;
  padding: 3rem 0;
}

@media (max-width: 640px) {
  .timeline-item {
    grid-template-columns: 5rem 1fr;
    gap: 1rem;
  }
}
</style>
