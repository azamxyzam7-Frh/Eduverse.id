document.addEventListener("DOMContentLoaded", () => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  // Mobile menu
  const menuBtn = $("#menuBtn"), navLinks = $("#navLinks");
  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => navLinks.classList.toggle("open"));
    navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navLinks.classList.remove("open")));
  }

  // Dark mode
  const themeToggle = $("#themeToggle");
  const savedTheme = localStorage.getItem("eduverse-theme");
  if (savedTheme === "dark") document.body.classList.add("dark");
  function updateThemeIcon() {
    if (themeToggle) themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
  }
  updateThemeIcon();
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      localStorage.setItem("eduverse-theme", document.body.classList.contains("dark") ? "dark" : "light");
      updateThemeIcon();
    });
  }

  // Category filter + search
  const cards = $$(".article-card");
  const filters = $$(".filter");
  const searchInput = $("#searchInput");
  const noResults = $("#noResults");
  let activeCategory = "all";

  function applyFilters() {
    const term = (searchInput?.value || "").trim().toLowerCase();
    let shown = 0;
    cards.forEach(card => {
      const categoryMatch = activeCategory === "all" || card.dataset.category === activeCategory;
      const searchText = (card.dataset.search + " " + card.textContent).toLowerCase();
      const searchMatch = !term || searchText.includes(term);
      const visible = categoryMatch && searchMatch;
      card.style.display = visible ? "" : "none";
      if (visible) shown++;
    });
    if (noResults) noResults.hidden = shown !== 0;
  }

  filters.forEach(btn => btn.addEventListener("click", () => {
    filters.forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    activeCategory = btn.dataset.category;
    applyFilters();
    document.querySelector("#artikel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }));

  $("#showAll")?.addEventListener("click", () => {
    activeCategory = "all";
    filters.forEach(x => x.classList.toggle("active", x.dataset.category === "all"));
    if (searchInput) searchInput.value = "";
    applyFilters();
  });
  searchInput?.addEventListener("input", applyFilters);

  // Article modal
  const modal = $("#articleModal"), modalTitle = $("#modalTitle"), modalContent = $("#modalContent"), modalClose = $("#modalClose");
  function closeModal() {
    modal?.classList.remove("open");
    modal?.setAttribute("aria-hidden", "true");
  }
  $$(".read-btn").forEach(btn => btn.addEventListener("click", () => {
    if (!modal) return;
    modalTitle.textContent = btn.dataset.title || "Materi";
    modalContent.textContent = btn.dataset.content || "Belum ada informasi.";
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }));
  modalClose?.addEventListener("click", closeModal);
  modal?.addEventListener("click", e => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

  // Quiz
  const questions = [
    { q: "Planet yang kita tinggali adalah ...", o: ["Mars", "Bumi", "Venus", "Jupiter"], a: 1 },
    { q: "Proses tumbuhan membuat makanan dengan bantuan cahaya disebut ...", o: ["Respirasi", "Fotosintesis", "Evaporasi", "Erosi"], a: 1 },
    { q: "Hasil dari 12 × 5 adalah ...", o: ["50", "55", "60", "65"], a: 2 },
    { q: "Bahasa yang digunakan untuk membuat struktur halaman web adalah ...", o: ["HTML", "CSS", "MP3", "JPEG"], a: 0 },
    { q: "Pusat tata surya adalah ...", o: ["Bumi", "Bulan", "Mars", "Matahari"], a: 3 },
    { q: "Algoritma adalah ...", o: ["Gambar komputer", "Langkah logis untuk menyelesaikan masalah", "Jenis perangkat keras", "Nama jaringan"], a: 1 },
    { q: "Luas persegi dengan sisi 5 cm adalah ...", o: ["10 cm²", "15 cm²", "20 cm²", "25 cm²"], a: 3 },
    { q: "Perubahan uap air menjadi titik-titik air disebut ...", o: ["Kondensasi", "Infiltrasi", "Erosi", "Pembakaran"], a: 0 },
    { q: "Kalimat efektif sebaiknya ...", o: ["Bertele-tele", "Tidak jelas", "Jelas dan tepat", "Selalu sangat panjang"], a: 2 },
    { q: "Salah satu tujuan daur ulang adalah ...", o: ["Menambah sampah", "Mengurangi penggunaan sumber daya baru", "Membuang semua barang", "Mengotori lingkungan"], a: 1 }
  ];

  const quizQuestion = $("#quizQuestion"), quizOptions = $("#quizOptions"), quizNext = $("#quizNext");
  const quizProgress = $("#quizProgress"), quizScore = $("#quizScore");
  let qi = 0, score = 0, answered = false, finished = false;

  function renderQuiz() {
    if (!quizQuestion || !quizOptions || !quizNext) return;
    answered = false;
    const item = questions[qi];
    quizQuestion.textContent = item.q;
    quizOptions.innerHTML = "";
    quizNext.hidden = true;
    quizNext.textContent = "Soal Berikutnya →";
    quizProgress.textContent = `Soal ${qi + 1} dari ${questions.length}`;
    quizScore.textContent = `Skor: ${score}`;

    item.o.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "quiz-option";
      button.textContent = option;
      button.addEventListener("click", () => {
        if (answered || finished) return;
        answered = true;
        [...quizOptions.children].forEach(b => b.disabled = true);

        if (index === item.a) {
          score++;
          button.classList.add("correct");
        } else {
          button.classList.add("wrong");
          quizOptions.children[item.a]?.classList.add("correct");
        }
        quizScore.textContent = `Skor: ${score}`;
        quizNext.hidden = false;
        quizNext.textContent = qi === questions.length - 1 ? "Lihat Hasil →" : "Soal Berikutnya →";
      });
      quizOptions.appendChild(button);
    });
  }

  quizNext?.addEventListener("click", () => {
    if (!answered && !finished) return;
    if (qi < questions.length - 1) {
      qi++;
      renderQuiz();
    } else {
      finished = true;
      quizQuestion.textContent = `🎉 Kuis selesai! Skormu ${score}/${questions.length}`;
      quizOptions.innerHTML = `<p style="color:var(--muted)">Bagus! Tekan tombol di bawah untuk mengulang kuis.</p>`;
      quizProgress.textContent = "Kuis selesai";
      quizScore.textContent = `Skor akhir: ${score}/${questions.length}`;
      quizNext.hidden = false;
      quizNext.textContent = "Ulangi Kuis ↻";
      quizNext.onclick = () => {
        qi = 0; score = 0; finished = false;
        quizNext.onclick = null;
        renderQuiz();
      };
    }
  });

  $("#year").textContent = new Date().getFullYear();
  applyFilters();
  renderQuiz();
});
