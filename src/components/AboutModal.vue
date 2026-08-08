<script setup>
defineProps({ open: Boolean })
defineEmits(['close'])

const iconAuthors = ['carl-olsen', 'caro-asercion', 'delapouite', 'lorc', 'lucasms', 'sbed', 'skoll', 'sparker', 'various-artists']
</script>

<template>
  <Teleport to="body">
    <Transition name="about-fade">
      <div v-if="open" class="about-backdrop" @click.self="$emit('close')">
        <div class="about-modal" role="dialog" aria-label="About Crest Foundry">
          <button class="about-close" title="Close" @click="$emit('close')">×</button>

          <h2 class="about-title">⚒ Crest Foundry</h2>
          <p class="about-tagline">Design and export a crest for any club — football, scholastic, recreational, intramural, social, role-playing, and more.</p>
          <p class="about-byline">A project by <a href="https://www.drinkingtheink.com/" target="_blank" rel="noopener">Jason M Harrison</a></p>

          <div class="about-section">
            <h3 class="about-heading">Credits</h3>
            <p class="about-text">
              Many heraldic symbols come from
              <a href="https://game-icons.net" target="_blank" rel="noopener">game-icons.net</a>,
              licensed under
              <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC&nbsp;BY&nbsp;3.0</a>.
              Created by {{ iconAuthors.join(', ') }}.
            </p>
            <p class="about-text" style="margin-top: 8px;">
              Additional symbols from
              <a href="https://fontawesome.com" target="_blank" rel="noopener">Font&nbsp;Awesome&nbsp;Free</a>
              (<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC&nbsp;BY&nbsp;4.0</a>)
              and
              <a href="https://pictogrammers.com/library/mdi/" target="_blank" rel="noopener">Material&nbsp;Design&nbsp;Icons</a>
              (<a href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noopener">Apache&nbsp;2.0</a>).
            </p>
            <p class="about-text" style="margin-top: 8px;">
              Background photography from
              <a href="https://unsplash.com" target="_blank" rel="noopener">Unsplash</a>.
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.about-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.about-modal {
  position: relative;
  width: min(420px, calc(100vw - 40px));
  background: #13131a;
  border: 1px solid #2a2a35;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
}

.about-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1px solid #2a2a35;
  background: #1e1e28;
  color: #888;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.about-close:hover { border-color: #e05555; color: #e05555; }

.about-title {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #e8c84a;
}

.about-tagline {
  margin: 0 0 3px;
  font-size: 13px;
  color: #888;
}

.about-byline {
  margin: 0 0 20px;
  font-size: 12px;
  color: #888;
}
.about-byline a {
  color: #e8c84a;
  text-decoration: none;
  border-bottom: 1px solid rgba(232, 200, 74, 0.35);
}
.about-byline a:hover { border-bottom-color: #e8c84a; }

.about-heading {
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #e8d06a;
}

.about-text {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: #b9b6b6;
}

.about-text a {
  color: #e8c84a;
  text-decoration: none;
  border-bottom: 1px solid rgba(232, 200, 74, 0.35);
}
.about-text a:hover { border-bottom-color: #e8c84a; }

.about-fade-enter-active,
.about-fade-leave-active { transition: opacity 0.2s ease; }
.about-fade-enter-from,
.about-fade-leave-to { opacity: 0; }
</style>
