<template>
  <section class="timeline-page">
    <header class="timeline-header">
      <h2>Histoire de la lumière et de l’industrialisation</h2>
      <p class="subtitle">Une frise interactive retraçant l’évolution de la lumière dans la vie humaine et industrielle.</p>

      <div class="controls">
        <input
          v-model="search"
          type="search"
          placeholder="Rechercher (ex : ampoule, gaz, LED...)"
          aria-label="Rechercher dans la frise"
        />
        <!-- <button @click="prev">◀</button>
        <button @click="togglePlay">{{ playing ? 'Pause' : 'Lecture' }}</button>
        <button @click="next">▶</button> -->
      </div>
    </header>

    <!-- Timeline -->
    <nav class="timeline-scroll" ref="scrollRef">
      <article
        v-for="(item, idx) in filtered"
        :key="item.id"
        :class="['timeline-item', { active: idx === currentIndex }]"
        @click="goTo(idx)"
        tabindex="0"
      >
        <img :src="item.image" :alt="item.title" class="timeline-image" />
        <time class="year">{{ item.year }}</time>
        <h2 class="title">{{ item.title }}</h2>
        <p class="short">{{ item.short }}</p>
        <button class="more-btn" @click.stop="goTo(idx)">En savoir plus</button>
      </article>
    </nav>

    <!-- Details -->
    <section class="timeline-details" ref="detailsRef">
      <h3>Événement sélectionné</h3>
      <div v-if="current" class="current-card">
        <img :src="current.image" :alt="current.title" class="detail-image" />
        <strong class="c-year">{{ current.year }}</strong>
        <h4 class="c-title">{{ current.title }}</h4>
        <p class="c-short">{{ current.short }}</p>
        <p class="c-long">{{ current.long }}</p>
      </div>
      <div v-else class="empty">Sélectionnez un événement dans la frise.</div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

// Import local images
import fireImg from '@/assets/light-history/fire.jpg'
import oilLampImg from '@/assets/light-history/oil-lamp.jpg'
import candleImg from '@/assets/light-history/candle.jpg'
import gaslightImg from '@/assets/light-history/gaslight.jpg'
import bulbImg from '@/assets/light-history/bulb.jpg'
import neonImg from '@/assets/light-history/neon.jpg'
import fluorescentImg from '@/assets/light-history/fluorescent.jpg'
import halogenImg from '@/assets/light-history/halogen.jpg'
import ledImg from '@/assets/light-history/led.jpg'
import smartlightImg from '@/assets/light-history/smartlight.jpg'

type EventItem = {
  id: string
  year: string
  title: string
  short: string
  long: string
  image: string
}

const items: EventItem[] = [
  {
    id: 'feu',
    year: '≈ 400 000 av. J.-C.',
    title: 'Maîtrise du feu',
    short: 'Première source de lumière maîtrisée par l’homme.',
    long: 'Les premiers humains domestiquent le feu, offrant chaleur, protection et lumière nocturne. C’est le début du contrôle de la lumière artificielle par l’humanité.',
    image: fireImg
  },
  {
    id: 'lampe-huile',
    year: '3000 av. J.-C.',
    title: 'Lampes à huile',
    short: 'Apparition des premières lampes artisanales.',
    long: 'Les civilisations mésopotamiennes et égyptiennes créent les premières lampes à huile, permettant un éclairage stable à l’intérieur des habitations.',
    image: oilLampImg
  },
  {
    id: 'bougie',
    year: 'Ier siècle',
    title: 'Bougie',
    short: 'L’éclairage devient plus portable et plus propre.',
    long: 'Les Romains inventent la bougie en cire d’abeille. Elle reste pendant des siècles la principale source de lumière domestique et religieuse.',
    image: candleImg
  },
  {
    id: 'gaz',
    year: '1790',
    title: 'Lumière au gaz',
    short: 'Première révolution industrielle de l’éclairage.',
    long: 'L’invention de la lampe à gaz permet l’éclairage des rues et usines. Londres et Paris installent des réseaux de gaz au début du XIXe siècle.',
    image: gaslightImg
  },
  {
    id: 'ampoule',
    year: '1879',
    title: 'Ampoule électrique',
    short: 'Thomas Edison perfectionne l’éclairage électrique.',
    long: 'Grâce au filament de carbone, Edison rend possible un éclairage propre, durable et sans flamme. Les villes s’électrifient à la fin du XIXe siècle.',
    image: bulbImg
  },
  {
    id: 'neon',
    year: '1910',
    title: 'Néon et publicité lumineuse',
    short: 'La lumière devient symbole de modernité et de spectacle.',
    long: 'L’ingénieur français Georges Claude invente le tube au néon, révolutionnant l’éclairage urbain et la communication visuelle dans les grandes métropoles.',
    image: neonImg
  },
  {
    id: 'fluorescent',
    year: '1930',
    title: 'Tube fluorescent',
    short: 'Éclairage industriel et économique.',
    long: 'Les tubes fluorescents remplacent les ampoules dans les usines, écoles et bureaux, offrant plus de lumière pour moins d’énergie.',
    image: fluorescentImg
  },
  {
    id: 'halogene',
    year: '1959',
    title: 'Ampoule halogène',
    short: 'Lumière plus blanche, plus efficace.',
    long: 'Cette innovation améliore la performance des ampoules à incandescence et devient courante dans les projecteurs, automobiles et luminaires domestiques.',
    image: halogenImg
  },
  {
    id: 'led',
    year: 'Années 1990',
    title: 'Diodes électroluminescentes (LED)',
    short: 'Une révolution énergétique et esthétique.',
    long: 'Les LED consomment très peu d’énergie, durent longtemps et permettent de nouveaux designs lumineux dans les foyers et l’espace public.',
    image: ledImg
  },
  {
    id: 'eclairage-connecte',
    year: 'Années 2010',
    title: 'Éclairage connecté',
    short: 'La lumière entre dans l’ère numérique.',
    long: 'Les ampoules intelligentes permettent de contrôler la couleur, l’intensité et la synchronisation depuis un smartphone ou un assistant vocal.',
    image: smartlightImg
  }
]

const search = ref('')
const currentIndex = ref(0)
// const playInterval = ref<number | null>(null)
// const playing = ref(false)
const scrollRef = ref<HTMLElement | null>(null)
const detailsRef = ref<HTMLElement | null>(null)

const filtered = computed(() =>
  items.filter(
    (it) =>
      it.title.toLowerCase().includes(search.value.toLowerCase()) ||
      it.short.toLowerCase().includes(search.value.toLowerCase()) ||
      it.year.includes(search.value)
  )
)

const current = computed(() => filtered.value[currentIndex.value] ?? null)

function clampIndex(i: number) {
  return Math.max(0, Math.min(i, filtered.value.length - 1))
}

function goTo(idx: number) {
  currentIndex.value = clampIndex(idx)
  nextTick(() => {
    const container = scrollRef.value
    const el = container?.children[currentIndex.value] as HTMLElement | undefined
    if (el && container) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center' })
    }
    detailsRef.value?.scrollIntoView({ behavior: 'smooth' })
  })
}

// function prev() { goTo(currentIndex.value - 1) }
// function next() { goTo(currentIndex.value + 1) }

// function startPlay() {
//   if (playInterval.value) return
//   playing.value = true
//   playInterval.value = window.setInterval(() => {
//     const nextIndex = currentIndex.value + 1
//     if (nextIndex >= filtered.value.length) stopPlay()
//     else goTo(nextIndex)
//   }, 2500)
// }

// function stopPlay() {
//   playing.value = false
//   if (playInterval.value) clearInterval(playInterval.value)
//   playInterval.value = null
// }

// function togglePlay() {
//   playing.value ? stopPlay() : startPlay()
// }

// onMounted(() => scrollRef.value?.focus())
// onBeforeUnmount(() => stopPlay())
// watch(search, () => (currentIndex.value = 0))
</script>

<style scoped>
.timeline-page {
  padding: 1.2rem 0;
  width: 100%;
  overflow-x: hidden;
}

.timeline-header {
  text-align: center;
  margin-bottom: 1rem;
}

.subtitle {
  margin-top: 0.5rem;
  color: #14213D;
}

.controls {
  margin-top: 0.8rem;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* TIMELINE */
.timeline-scroll {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding: 2rem;
  border-radius: 10px;
  background: #14213D;
  border: 1px solid #ddd;
  scroll-behavior: smooth;
  width: calc(100% - 100px);
  margin: 0 50px;
  box-sizing: border-box;
}

.timeline-item {
  min-width: 340px;
  max-width: 400px;
  background: #ADBABD;
  color: black;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.timeline-item.active {
  transform: scale(1.05);
  border-color: #0078d7;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}

.timeline-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 0.6rem;
}

.more-btn {
  background: #6CBEED;
  color: #14213D;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 0.5rem;
}

.timeline-details {
  margin-top: 2rem;
  background: #18435A;
  color: #ffff;
  border-radius: 10px;
  border: 1px solid #ddd;
  padding: 1rem 1.5rem;
  width: 100%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.detail-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 1rem;
}

.current-card {
  margin-top: 0.8rem;
  background: #14213D;
  color: white;
  border-radius: 8px;
  padding: 1rem;
}

.empty {
  color: #666;
  font-style: italic;
}
</style>
