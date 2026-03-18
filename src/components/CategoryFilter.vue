<template>
  <div>
    <!-- Category filter buttons -->
    <div
      style="
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 3rem;
      "
    >
      <button
        v-for="cat in categories"
        :key="cat.value"
        @click="activeCategory = cat.value"
        :style="{
          fontFamily: 'Space Mono, monospace',
          fontSize: '0.7rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          padding: '0.5rem 1.25rem',
          background: 'transparent',
          border: activeCategory === cat.value ? '1px solid #C8FF00' : '1px solid #444444',
          color: activeCategory === cat.value ? '#C8FF00' : '#F0EDE6',
          cursor: 'pointer',
          transition: 'border-color 0.2s ease, color 0.2s ease',
          lineHeight: '1',
        }"
        @mouseenter="(e) => { if (activeCategory !== cat.value) { e.target.style.borderColor = '#666'; e.target.style.color = '#F0EDE6'; } }"
        @mouseleave="(e) => { if (activeCategory !== cat.value) { e.target.style.borderColor = '#444444'; e.target.style.color = '#F0EDE6'; } }"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- Posts count -->
    <p
      style="
        font-family: 'Space Mono', monospace;
        font-size: 0.7rem;
        letter-spacing: 0.2em;
        color: #444444;
        text-transform: uppercase;
        margin-bottom: 2rem;
      "
    >
      {{ filteredPosts.length }} {{ filteredPosts.length === 1 ? 'POSTAGEM' : 'POSTAGENS' }}
    </p>

    <!-- Posts grid -->
    <div
      v-if="filteredPosts.length > 0"
      style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 360px), 1fr));
        gap: 1px;
        background-color: #1a1a1a;
        border: 1px solid #1a1a1a;
      "
    >
      <a
        v-for="post in filteredPosts"
        :key="post.slug"
        :href="`/blog/${post.slug}`"
        style="
          display: flex;
          flex-direction: column;
          background-color: #080808;
          text-decoration: none;
          transition: background-color 0.2s ease;
          overflow: hidden;
        "
        @mouseenter="(e) => e.currentTarget.style.backgroundColor = '#0e0e0e'"
        @mouseleave="(e) => e.currentTarget.style.backgroundColor = '#080808'"
      >
        <!-- Cover image -->
        <div
          v-if="post.cover"
          style="
            position: relative;
            aspect-ratio: 16/9;
            overflow: hidden;
            background-color: #1A1A1A;
          "
        >
          <img
            :src="post.cover"
            :alt="post.title"
            loading="lazy"
            decoding="async"
            style="
              width: 100%;
              height: 100%;
              object-fit: cover;
              display: block;
              filter: grayscale(20%);
              transition: transform 0.4s ease, filter 0.4s ease;
            "
            @mouseenter="(e) => { e.target.style.transform = 'scale(1.03)'; e.target.style.filter = 'grayscale(0%)'; }"
            @mouseleave="(e) => { e.target.style.transform = 'scale(1)'; e.target.style.filter = 'grayscale(20%)'; }"
          />
        </div>

        <!-- No cover placeholder -->
        <div
          v-else
          style="
            aspect-ratio: 16/9;
            background-color: #1A1A1A;
            display: flex;
            align-items: center;
            justify-content: center;
          "
        >
          <span
            style="
              font-family: 'Space Mono', monospace;
              font-size: 2rem;
              font-weight: 700;
              color: #2a2a2a;
              letter-spacing: 0.2em;
            "
          >OBRA</span>
        </div>

        <!-- Card content -->
        <div style="padding: 1.5rem; display: flex; flex-direction: column; flex: 1;">
          <!-- Meta row -->
          <div
            style="
              display: flex;
              align-items: center;
              gap: 0.75rem;
              margin-bottom: 1rem;
              flex-wrap: wrap;
            "
          >
            <!-- Category pill -->
            <span
              :style="{
                fontFamily: 'Space Mono, monospace',
                fontSize: '0.6rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                padding: '0.2rem 0.6rem',
                background: 'transparent',
                border: `1px solid ${categoryColor(post.category)}`,
                color: categoryColor(post.category),
                whiteSpace: 'nowrap',
              }"
            >
              {{ categoryLabel(post.category) }}
            </span>

            <!-- Date -->
            <time
              :datetime="post.date"
              style="
                font-family: 'Space Mono', monospace;
                font-size: 0.65rem;
                color: #444444;
                letter-spacing: 0.1em;
                text-transform: uppercase;
              "
            >
              {{ formatDate(post.date) }}
            </time>
          </div>

          <!-- Title -->
          <h2
            style="
              font-family: 'Syne', system-ui, sans-serif;
              font-size: 1.25rem;
              font-weight: 700;
              line-height: 1.2;
              color: #F0EDE6;
              margin: 0 0 0.75rem 0;
              letter-spacing: -0.01em;
            "
          >
            {{ post.title }}
          </h2>

          <!-- Description -->
          <p
            v-if="post.description"
            style="
              font-family: 'Barlow Condensed', system-ui, sans-serif;
              font-size: 1rem;
              line-height: 1.5;
              color: #888888;
              margin: 0 0 1.5rem 0;
              flex: 1;
            "
          >
            {{ truncate(post.description, 120) }}
          </p>

          <!-- Read more -->
          <span
            style="
              font-family: 'Space Mono', monospace;
              font-size: 0.65rem;
              letter-spacing: 0.2em;
              text-transform: uppercase;
              color: #C8FF00;
              margin-top: auto;
              display: flex;
              align-items: center;
              gap: 0.5rem;
            "
          >
            LER
            <span aria-hidden="true" style="font-size: 0.8rem;">→</span>
          </span>
        </div>
      </a>
    </div>

    <!-- Empty state -->
    <div
      v-else
      style="
        padding: 5rem 0;
        text-align: center;
        border: 1px solid #1A1A1A;
      "
    >
      <p
        style="
          font-family: 'Space Mono', monospace;
          font-size: 0.75rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #444444;
        "
      >
        NENHUMA POSTAGEM NESTA CATEGORIA
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  posts: {
    type: Array,
    required: true,
    default: () => [],
  },
  initialCategory: {
    type: String,
    default: "todos",
  },
});

const categories = [
  { value: "todos", label: "TODOS" },
  { value: "evento-interno", label: "EVENTOS INTERNOS" },
  { value: "evento-rua", label: "EVENTOS DE RUA" },
  { value: "evento-coletivo", label: "EVENTOS COLETIVOS" },
];

const activeCategory = ref(props.initialCategory || "todos");

const filteredPosts = computed(() => {
  if (activeCategory.value === "todos") return props.posts;
  return props.posts.filter((p) => p.category === activeCategory.value);
});

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function truncate(str, len) {
  if (!str) return "";
  if (str.length <= len) return str;
  return str.slice(0, len).trimEnd() + "…";
}

function categoryLabel(slug) {
  const map = {
    "evento-interno": "INTERNO",
    "evento-rua": "RUA",
    "evento-coletivo": "COLETIVO",
  };
  return map[slug] ?? slug;
}

function categoryColor(slug) {
  const map = {
    "evento-interno": "#C8FF00",
    "evento-rua": "#F0EDE6",
    "evento-coletivo": "#888888",
  };
  return map[slug] ?? "#444444";
}
</script>
