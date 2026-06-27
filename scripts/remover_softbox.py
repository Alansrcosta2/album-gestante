"""
Removedor de Softbox com PicWish API
=====================================
Mostra cada foto, marca o softbox clicando ponto a ponto no contorno,
e envia pra API do PicWish com máscara.

COMO USAR:
  1. pip install pillow requests
  2. python remover_softbox.py
  3. Clique nos cantos do softbox, Enter pra fechar, P pra processar
"""

import os, io
from pathlib import Path
import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image, ImageTk, ImageDraw
import requests

PICWISH_API_KEY = "wxmespgsvmv46oad6"
PASTA_RAIZ = os.path.dirname(os.path.abspath(__file__))
PASTA_FOTOS = PASTA_RAIZ
PASTA_SAIDA = os.path.join(PASTA_RAIZ, "limpas")
INICIAR_DE = 14  # Pular as 14 já processadas

API_URL = "https://techhk.aoscdn.com/api/tasks/visual/inpaint"


class App:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Remover Softbox - Álbum Gestante")
        self.root.geometry("1100x750")
        self.pasta = PASTA_FOTOS
        self.saida = PASTA_SAIDA

        self.fotos = []
        self.indice = 0
        self.foto_pil = None
        self.img_tk = None
        self.poligonos = []    # lista de polígonos fechados
        self.pontos_atual = [] # pontos do polígono sendo desenhado
        self.fechado = False
        self.zoom = 1.0

        self._ui()
        self._carregar_pasta()

    def _ui(self):
        barra = tk.Frame(self.root)
        barra.pack(fill=tk.X, padx=10, pady=5)

        self.info = tk.Label(barra, text="", font=("Arial", 10))
        self.info.pack(side=tk.LEFT)

        tk.Button(barra, text="↩ Desfazer", command=self._desfazer).pack(side=tk.RIGHT, padx=2)
        tk.Button(barra, text="⭕ Fechar (Enter)", command=self._fechar).pack(side=tk.RIGHT, padx=2)
        tk.Button(barra, text="➕ Novo Polígono", command=self._novo_poligono).pack(side=tk.RIGHT, padx=2)
        self.btn_proc = tk.Button(barra, text="Processar (P)", bg="#4CAF50", fg="white", command=self._processar)
        self.btn_proc.pack(side=tk.RIGHT, padx=2)
        self.btn_lote = tk.Button(barra, text="Processar Lote 25", bg="#2196F3", fg="white", command=self._processar_lote)
        self.btn_lote.pack(side=tk.RIGHT, padx=2)
        tk.Button(barra, text="⏭ Pular (N)", command=self._pular).pack(side=tk.RIGHT, padx=2)

        # Frame com scrollbars
        scroll_frame = tk.Frame(self.root)
        scroll_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)

        self.canvas = tk.Canvas(scroll_frame, bg="#222", cursor="cross")
        vbar = tk.Scrollbar(scroll_frame, orient=tk.VERTICAL, command=self.canvas.yview)
        hbar = tk.Scrollbar(scroll_frame, orient=tk.HORIZONTAL, command=self.canvas.xview)
        self.canvas.configure(yscrollcommand=vbar.set, xscrollcommand=hbar.set)

        self.canvas.grid(row=0, column=0, sticky="nsew")
        vbar.grid(row=0, column=1, sticky="ns")
        hbar.grid(row=1, column=0, sticky="ew")
        scroll_frame.grid_rowconfigure(0, weight=1)
        scroll_frame.grid_columnconfigure(0, weight=1)

        self.canvas.bind("<Button-1>", self._click)
        self.canvas.bind("<MouseWheel>", self._roda_zoom)
        self.canvas.bind("<Button-2>", self._iniciar_pan)     # Middle click
        self.canvas.bind("<B2-Motion>", self._mover_pan)
        self.root.bind("<Return>", lambda e: self._fechar())
        self.root.bind("<p>", lambda e: self._processar())
        self.root.bind("<n>", lambda e: self._pular())
        self.root.bind("<BackSpace>", lambda e: self._desfazer())

        rodape = tk.Frame(self.root)
        rodape.pack(fill=tk.X, padx=10, pady=5)
        tk.Button(rodape, text="Escolher Pasta", command=self._escolher_pasta).pack(side=tk.LEFT)
        self.status = tk.Label(rodape, text="", fg="gray")
        self.status.pack(side=tk.RIGHT)

        self.modo_label = tk.Label(rodape, text="", fg="#e94560")
        self.modo_label.pack(side=tk.RIGHT, padx=10)

    def _carregar_pasta(self):
        if not os.path.isdir(self.pasta):
            messagebox.showerror("Erro", f"Pasta não encontrada:\n{self.pasta}")
            return
        if not os.path.isdir(self.saida):
            os.makedirs(self.saida)

        self.fotos = sorted(
            str(p.relative_to(self.pasta))
            for p in Path(self.pasta).rglob("*")
            if p.suffix.lower() in ('.jpg', '.jpeg', '.png')
            and not p.parent.name == "limpas"
        )
        if INICIAR_DE > 0:
            self.fotos = self.fotos[INICIAR_DE:]
        self.indice = 0
        self._exibir()
        self._mostrar_info()

    def _mostrar_info(self):
        if self.indice < len(self.fotos):
            self.info.config(text=f"{self.indice + 1}/{len(self.fotos)} — {self.fotos[self.indice]}")
        else:
            self.info.config(text="✓ Todas as fotos processadas!")

    def _exibir(self):
        if self.indice >= len(self.fotos):
            self.canvas.delete("all")
            self.canvas.create_text(self.canvas.winfo_width() // 2 or 500,
                                    self.canvas.winfo_height() // 2 or 300,
                                    text="✓ Todas concluídas!", fill="white",
                                    font=("Arial", 24))
            return

        caminho = os.path.join(self.pasta, self.fotos[self.indice])
        self.foto_pil = Image.open(caminho).convert("RGB")
        self.zoom = 1.0
        self.poligonos = []
        self.pontos_atual = []
        self.fechado = False
        self.btn_proc.config(state=tk.DISABLED)
        self._renderizar()
        self._atualizar_modo()
        self._mostrar_info()

    def _renderizar(self):
        if not self.foto_pil:
            return

        cw = max(self.canvas.winfo_width(), 100)
        ch = max(self.canvas.winfo_height(), 100)
        iw, ih = self.foto_pil.size
        escala_base = min(cw / iw, ch / ih)
        self.escala = escala_base * self.zoom
        dw, dh = int(iw * self.escala), int(ih * self.escala)

        img = self.foto_pil.resize((dw, dh), Image.LANCZOS)
        self.img_tk = ImageTk.PhotoImage(img)
        self.canvas.delete("all")

        self.canvas.config(scrollregion=(0, 0, dw, dh))
        self.offset_x = 0
        self.offset_y = 0
        self.draw_w, self.draw_h = dw, dh

        # Centralizar quando encaixa na tela
        if dw <= cw:
            self.canvas.xview_moveto(0)
        if dh <= ch:
            self.canvas.yview_moveto(0)

        self.canvas.create_image(0, 0, image=self.img_tk, anchor=tk.NW, tags="foto")
        self._desenhar_poligono()

    def _canvas_para_img(self, cx, cy):
        return ((cx - self.offset_x) / self.escala,
                (cy - self.offset_y) / self.escala)

    def _img_para_canvas(self, ix, iy):
        return (ix * self.escala + self.offset_x,
                iy * self.escala + self.offset_y)

    def _desenhar_poligono(self):
        self.canvas.delete("poly")
        cores = ["#e94560", "#2196F3", "#FF9800", "#4CAF50", "#9C27B0"]

        # Desenhar polígonos já fechados
        for pi, pts in enumerate(self.poligonos):
            cor = cores[pi % len(cores)]
            pts_c = [(p[0] * self.escala + self.offset_x,
                      p[1] * self.escala + self.offset_y) for p in pts]
            if len(pts) >= 3:
                self.canvas.create_polygon(
                    pts_c, fill=cor, stipple="gray25",
                    outline=cor, width=2, tags="poly"
                )
            # Número do polígono
            cx = sum(p[0] for p in pts_c) / len(pts_c)
            cy = sum(p[1] for p in pts_c) / len(pts_c)
            self.canvas.create_text(cx, cy, text=str(pi + 1),
                                    fill="white", font=("Arial", 10, "bold"), tags="poly")

        # Desenhar polígono atual (sendo desenhado)
        pts = self.pontos_atual
        if not pts:
            return
        pts_c = [(p[0] * self.escala + self.offset_x,
                  p[1] * self.escala + self.offset_y) for p in pts]

        for i, (x, y) in enumerate(pts_c):
            self.canvas.create_oval(
                x - 4, y - 4, x + 4, y + 4,
                fill="white", outline="#e94560", width=2, tags="poly"
            )
            if i > 0:
                self.canvas.create_line(
                    pts_c[i - 1][0], pts_c[i - 1][1],
                    x, y, fill="#e94560", width=2, tags="poly"
                )

    def _click(self, event):
        if not self.foto_pil or self.fechado:
            return
        x = (event.x - self.offset_x) / self.escala
        y = (event.y - self.offset_y) / self.escala
        if x < 0 or y < 0 or x > self.foto_pil.width or y > self.foto_pil.height:
            return
        self.pontos_atual.append((x, y))
        self._desenhar_poligono()
        self._atualizar_modo()
        if len(self.pontos_atual) >= 3:
            self.btn_proc.config(state=tk.NORMAL)

    def _fechar(self):
        if len(self.pontos_atual) < 3:
            self.status.config(text="Mínimo 3 pontos!")
            return
        self.poligonos.append(list(self.pontos_atual))
        self.pontos_atual = []
        self.fechado = False
        self._desenhar_poligono()
        self._atualizar_modo()
        self.status.config(text=f"✓ Polígono {len(self.poligonos)} fechado! Marque outro ou P pra processar.")

    def _novo_poligono(self):
        if self.fechado:
            self._fechar()
        self.pontos_atual = []
        self.fechado = False
        self._desenhar_poligono()
        self._atualizar_modo()
        self.status.config(text="Novo polígono. Clique nos pontos.")

    def _desfazer(self):
        if self.pontos_atual:
            self.pontos_atual.pop()
            self._desenhar_poligono()
            self._atualizar_modo()
            self.btn_proc.config(state=tk.NORMAL if len(self.pontos_atual) >= 3 else tk.DISABLED)
            self.status.config(text="Último ponto removido.")
        elif self.poligonos:
            self.poligonos.pop()
            self._desenhar_poligono()
            self._atualizar_modo()
            self.status.config(text=f"Último polígono removido. Restam {len(self.poligonos)}.")
        else:
            self.status.config(text="Nada pra desfazer.")

    def _atualizar_modo(self):
        total = len(self.poligonos)
        atual = len(self.pontos_atual)
        if atual > 0:
            self.modo_label.config(text=f"Polígonos: {total} fechados + 1 atual ({atual} pts)")
        else:
            self.modo_label.config(text=f"Polígonos: {total} fechados")

    def _iniciar_pan(self, event):
        self.canvas.scan_mark(event.x, event.y)

    def _mover_pan(self, event):
        self.canvas.scan_dragto(event.x, event.y, gain=1)

    def _roda_zoom(self, event):
        self.zoom *= 1.1 if event.delta > 0 else 0.9
        self.zoom = max(0.3, min(5, self.zoom))
        self._renderizar()

    def _gerar_mascara(self):
        mask = Image.new("L", self.foto_pil.size, 0)
        draw = ImageDraw.Draw(mask)
        for pts in self.poligonos:
            if len(pts) >= 3:
                draw.polygon(pts, fill=255)
        return mask

    def _processar(self):
        if self.pontos_atual:
            self._fechar()
        if not self.poligonos:
            messagebox.showwarning("Aviso", "Marque pelo menos um polígono no softbox!")
            return

        self.status.config(text="Gerando máscara...")
        self.root.update()

        mask = self._gerar_mascara()
        buf_mask = io.BytesIO()
        mask.save(buf_mask, format="PNG")
        buf_mask.seek(0)

        buf_img = io.BytesIO()
        self.foto_pil.save(buf_img, format="JPEG", quality=95)
        buf_img.seek(0)

        self.status.config(text="Enviando pro PicWish...")
        self.root.update()

        try:
            files = {
                "image_file": ("foto.jpg", buf_img, "image/jpeg"),
                "mask_file": ("mask.png", buf_mask, "image/png"),
            }
            data = {"sync": "1"}
            headers = {"X-API-KEY": PICWISH_API_KEY}

            resp = requests.post(API_URL, headers=headers, files=files, data=data, timeout=120)
            result = resp.json()

            if result.get("status") == 200 and result.get("data", {}).get("state") == 1:
                img_url = result["data"]["image"]
                img_resp = requests.get(img_url, timeout=60)
                nome = self.fotos[self.indice]
                saida_path = os.path.join(self.saida, nome)
                os.makedirs(os.path.dirname(saida_path), exist_ok=True)
                with open(saida_path, "wb") as f:
                    f.write(img_resp.content)
                self.status.config(text=f"✓ Salvo: {nome}")
                self._proxima()
            else:
                msg = result.get("message") or result.get("data", {}).get("err_message", "Erro desconhecido")
                self.status.config(text=f"✗ {msg}")
                if "credit" in msg.lower() or "balance" in msg.lower() or "insufficient" in msg.lower():
                    messagebox.showerror("Créditos Esgotados", f"{msg}\n\nCrie outra conta no PicWish e troque a chave no script!")
                else:
                    messagebox.showerror("Erro API", msg)
        except Exception as e:
            self.status.config(text=f"✗ {e}")
            messagebox.showerror("Erro", str(e))

    def _processar_lote(self):
        if self.pontos_atual:
            self._fechar()
        if not self.poligonos:
            messagebox.showwarning("Aviso", "Marque pelo menos um polígono no softbox!")
            return

        restantes = len(self.fotos) - self.indice
        qtd = min(25, restantes)
        resp = messagebox.askyesno(
            "Processar Lote",
            f"Processar {qtd} fotos (da {self.indice + 1} à {self.indice + qtd})\n"
            f"com a mesma máscara?\n\n"
            f"A conta PicWish tem 25 créditos. "
            f"Recomendo processar {qtd} agora, criar outra conta, e continuar."
        )
        if not resp:
            return

        self.status.config(text="Gerando máscara p/ lote...")
        self.root.update()
        mask = self._gerar_mascara()

        buf_mask = io.BytesIO()
        mask.save(buf_mask, format="PNG")
        buf_mask.seek(0)
        mask_data = buf_mask.getvalue()

        total_ok = 0
        total_erro = 0

        for i in range(qtd):
            idx = self.indice + i
            nome = self.fotos[idx]
            caminho = os.path.join(self.pasta, nome)

            self.status.config(text=f"[{i + 1}/{qtd}] {nome}...")
            self.info.config(text=f"{idx + 1}/{len(self.fotos)} — {nome}")
            self.root.update()

            try:
                foto = Image.open(caminho).convert("RGB")
                buf_img = io.BytesIO()
                foto.save(buf_img, format="JPEG", quality=95)
                buf_img.seek(0)

                files = {
                    "image_file": ("foto.jpg", buf_img, "image/jpeg"),
                    "mask_file": ("mask.png", io.BytesIO(mask_data), "image/png"),
                }
                headers = {"X-API-KEY": PICWISH_API_KEY}

                resp = requests.post(
                    API_URL, headers=headers, files=files,
                    data={"sync": "1"}, timeout=120
                )
                result = resp.json()

                if result.get("status") == 200 and result.get("data", {}).get("state") == 1:
                    img_url = result["data"]["image"]
                    img_resp = requests.get(img_url, timeout=60)
                    saida_path = os.path.join(self.saida, nome)
                    os.makedirs(os.path.dirname(saida_path), exist_ok=True)
                    with open(saida_path, "wb") as f:
                        f.write(img_resp.content)
                    total_ok += 1
                else:
                    msg = result.get("message") or result.get("data", {}).get("err_message", "Erro")
                    print(f"  Erro {nome}: {msg}")
                    total_erro += 1
                    if "credit" in msg.lower() or "balance" in msg.lower():
                        break
            except Exception as e:
                print(f"  Erro {nome}: {e}")
                total_erro += 1

        self.status.config(text=f"Lote concluído: {total_ok} ok, {total_erro} erro(s)")
        messagebox.showinfo("Lote", f"{total_ok} ok, {total_erro} erro(s)")

        if total_ok > 0:
            self.indice += total_ok
        self._exibir()
        self._mostrar_info()

        if total_erro > 0 and total_ok > 0:
            messagebox.showwarning(
                "Atenção",
                f"{total_erro} foto(s) falharam. "
                "Pode ser que os créditos da API acabaram.\n"
                "Troque a chave PICWISH_API_KEY no script e tente de novo."
            )

    def _pular(self):
        self._proxima()

    def _proxima(self):
        self.indice += 1
        self._exibir()
        self._mostrar_info()

    def _escolher_pasta(self):
        pasta = filedialog.askdirectory(title="Escolher pasta com as fotos")
        if pasta:
            self.pasta = pasta
            self._carregar_pasta()

    def run(self):
        self.root.mainloop()


if __name__ == "__main__":
    App().run()
