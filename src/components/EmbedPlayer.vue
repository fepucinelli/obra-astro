<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  url: string;
  title: string;
}>();

type EmbedType = "youtube" | "soundcloud" | "unknown";

const embedType = computed<EmbedType>(() => {
  if (props.url.includes("youtube.com") || props.url.includes("youtu.be")) {
    return "youtube";
  }
  if (props.url.includes("soundcloud.com")) {
    return "soundcloud";
  }
  return "unknown";
});

function extractYouTubeId(url: string): string {
  // Handle youtu.be short URLs
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return shortMatch[1];

  // Handle youtube.com/watch?v=
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return watchMatch[1];

  // Handle youtube.com/embed/
  const embedMatch = url.match(/\/embed\/([^?]+)/);
  if (embedMatch) return embedMatch[1];

  return "";
}

const youtubeEmbedUrl = computed(() => {
  if (embedType.value !== "youtube") return "";
  const id = extractYouTubeId(props.url);
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&color=white`;
});

const soundcloudEmbedUrl = computed(() => {
  if (embedType.value !== "soundcloud") return "";
  const encoded = encodeURIComponent(props.url);
  return `https://w.soundcloud.com/player/?url=${encoded}&color=%23C8FF00&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`;
});
</script>

<template>
  <div class="embed-player">
    <!-- YouTube -->
    <div v-if="embedType === 'youtube'" class="embed-container youtube-container">
      <iframe
        :src="youtubeEmbedUrl"
        :title="title"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        loading="lazy"
        frameborder="0"
      ></iframe>
    </div>

    <!-- SoundCloud -->
    <div v-else-if="embedType === 'soundcloud'" class="embed-container soundcloud-container">
      <iframe
        :src="soundcloudEmbedUrl"
        :title="title"
        allow="autoplay"
        loading="lazy"
        frameborder="0"
        scrolling="no"
      ></iframe>
    </div>

    <!-- Fallback -->
    <div v-else class="embed-fallback">
      <a :href="url" target="_blank" rel="noopener noreferrer" class="embed-link">
        ABRIR AUDIO →
      </a>
    </div>
  </div>
</template>

<style scoped>
.embed-player {
  width: 100%;
}

.embed-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #1A1A1A;
}

/* YouTube: 16:9 */
.youtube-container {
  aspect-ratio: 16 / 9;
}

.youtube-container iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
}

/* SoundCloud: visual player is taller */
.soundcloud-container {
  height: 400px;
}

.soundcloud-container iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* Fallback */
.embed-fallback {
  padding: 2rem;
  border: 1px solid #444444;
  display: flex;
  align-items: center;
  justify-content: center;
}

.embed-link {
  font-family: "Space Mono", "Courier New", monospace;
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #C8FF00;
  text-decoration: none;
  transition: color 0.2s ease;
}

.embed-link:hover {
  color: #F0EDE6;
}
</style>
