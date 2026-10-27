(function () {
  const DADOS = window.DADOS || [];
  const P = window.PAGINA || { tipo: "inicio" };
  const WA = "5598999073710";
  const CAT = { nicho: "Nicho", masc: "Masculino", fem: "Feminino", home: "Home Spray" };
  const $ = (s) => document.querySelector(s);
  const grade = $("#grade");
  const estado = { sub: "", q: "" };

  let selecao = [];
  try { selecao = JSON.parse(localStorage.getItem("macion-selecao") || "[]").filter((id) => DADOS.some((d) => d.id === id)); } catch (e) {}
  const salvar = () => { try { localStorage.setItem("macion-selecao", JSON.stringify(selecao)); } catch (e) {} };

  const norm = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const rotulo = (d) => (d.c === "nicho" ? "Nicho · " + d.s : CAT[d.c]);
  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m5 12 5 5 9-10"/></svg>';

  function lista() {
    if (P.tipo === "inicio") return P.ids.map((id) => DADOS.find((d) => d.id === id)).filter(Boolean);
    const q = norm(estado.q);
    return DADOS.filter((d) => {
      if (d.c !== P.cat) return false;
      if (estado.sub && d.s !== estado.sub) return false;
      if (q && !norm([d.n, d.b, d.t, d.m, d.f, d.d].join(" ")).includes(q)) return false;
      return true;
    });
  }

  function render() {
    if (!grade) return;
    const l = lista();
    const cont = $("#contagem");
    if (cont) cont.textContent = l.length + (l.length === 1 ? (P.cat === "home" ? " aroma" : " fragrância") : (P.cat === "home" ? " aromas" : " fragrâncias"));
    if (!l.length) {
      grade.innerHTML = '<div class="vazio" style="grid-column:1/-1"><b>Nenhuma fragrância encontrada</b>Tente outro nome, marca ou nota, como "baunilha" ou "Dior".</div>';
      return;
    }
    grade.innerHTML = l.map((d) => `
      <button class="item" data-id="${d.id}" type="button" aria-label="${d.n}${d.c === "home" ? "" : ", inspirado em " + d.b}. Ver notas">
        <div class="foto">
          ${d.x ? `<span class="selo">${d.x}</span>` : ""}
          ${selecao.includes(d.id) ? `<span class="marcado" title="Na sua seleção">${CHECK}</span>` : ""}
          <img loading="lazy" src="/img/${d.id}.webp" alt="">
        </div>
        <span class="nome">${d.n}</span>
        <span class="ref">${d.c === "home" ? "Home Spray · 200 ml" : "Insp. " + d.b}</span>
        <span class="tag">${rotulo(d)}${d.c === "home" ? "" : " · 55 ml"}</span>
      </button>`).join("");
  }

  function atualizarSelecao() {
    const bar = $("#selecao");
    bar.hidden = selecao.length === 0;
    $("#qtd").textContent = selecao.length;
    const itens = selecao.map((id) => DADOS.find((d) => d.id === id)).filter(Boolean);
    const linhas = itens.map((d) => (d.c === "home" ? `• Home Spray ${d.n} (200 ml)` : `• ${d.n} – inspirado em ${d.b} (55 ml)`));
    $("#enviar").href = `https://wa.me/${WA}?text=${encodeURIComponent("Olá, Macion! Gostaria de pedir:\n" + linhas.join("\n"))}`;
  }

  document.querySelectorAll("#subNicho button").forEach((b) => b.addEventListener("click", () => {
    estado.sub = b.dataset.sub;
    document.querySelectorAll("#subNicho button").forEach((o) => o.setAttribute("aria-pressed", o === b));
    render();
  }));
  const busca = $("#busca");
  if (busca) busca.addEventListener("input", (e) => { estado.q = e.target.value; render(); });

  const ficha = $("#ficha");
  let atual = null;
  function botaoAdd() { $("#fAdd").textContent = selecao.includes(atual.id) ? "Remover da seleção" : "Adicionar à seleção"; }
  function abrir(id) {
    const d = DADOS.find((x) => x.id === id);
    if (!d) return;
    atual = d;
    $("#fImg").src = `/img/${d.id}.webp`;
    $("#fImg").alt = d.n;
    $("#fCat").textContent = rotulo(d) + (d.x ? " · " + d.x : "");
    $("#fNome").textContent = d.n;
    $("#fInsp").innerHTML = d.c === "home" ? "Perfume para ambientes" : `Inspirado em <b>${d.n}</b>, de ${d.b}`;
    $("#fNotas").innerHTML = d.c === "home"
      ? `<div><dt>Aroma</dt><dd>${d.d}</dd></div>`
      : `<div><dt>Saída</dt><dd>${d.t}</dd></div><div><dt>Corpo</dt><dd>${d.m}</dd></div><div><dt>Fundo</dt><dd>${d.f}</dd></div>`;
    $("#fVol").textContent = d.c === "home" ? "200 ml" : "55 ml";
    $("#fVolTx").textContent = d.c === "home" ? "frasco spray" : "frasco";
    const msg = d.c === "home" ? `Olá, Macion! Quero o Home Spray ${d.n} (200 ml).` : `Olá, Macion! Quero o perfume ${d.n}, inspirado em ${d.b} (55 ml).`;
    $("#fWa").href = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
    botaoAdd();
    ficha.showModal();
  }
  $("#fAdd").addEventListener("click", () => {
    const i = selecao.indexOf(atual.id);
    i >= 0 ? selecao.splice(i, 1) : selecao.push(atual.id);
    salvar(); botaoAdd(); atualizarSelecao(); render();
  });
  if (grade) grade.addEventListener("click", (e) => { const b = e.target.closest(".item"); if (b) abrir(b.dataset.id); });
  $("#fechar").addEventListener("click", () => ficha.close());
  ficha.addEventListener("click", (e) => { if (e.target === ficha) ficha.close(); });
  $("#limpar").addEventListener("click", () => { selecao = []; salvar(); atualizarSelecao(); render(); });

  const copiar = $("#copiar");
  if (copiar) copiar.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText("98999073710"); copiar.textContent = "Copiado"; }
    catch (e) { const r = document.createRange(); r.selectNodeContents($("#numero")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); copiar.textContent = "Selecionado"; }
    setTimeout(() => (copiar.textContent = "Copiar"), 1800);
  });

  render();
  atualizarSelecao();
})();
