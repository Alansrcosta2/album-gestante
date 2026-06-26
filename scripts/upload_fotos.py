"""
Script de upload em lote para o álbum gestante.

Uso:
    pip install -r requirements.txt
    python upload_fotos.py

Certifique-se de configurar as variáveis de ambiente:
    SUPABASE_URL
    SUPABASE_SERVICE_KEY
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client
from PIL import Image

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
BUCKET_NAME = "fotos_gestante"
FOTOS_DIR = Path(r"C:\Users\Alan Costa\Desktop\albuns")

PASTAS = [
    ("pasta1_sem_marca", 1),
    ("pasta2_sem_marca", 2),
    ("pasta3_sem_marca", 3),
    ("pasta4_sem_marca", 4),
    ("pasta5_sem_marca", 5),
]


def init_supabase() -> Client:
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("Erro: Defina SUPABASE_URL e SUPABASE_SERVICE_KEY no .env")
        sys.exit(1)
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def ensure_bucket(supabase: Client):
    """Cria o bucket se não existir."""
    try:
        supabase.storage.get_bucket(BUCKET_NAME)
        print(f"Bucket '{BUCKET_NAME}' já existe.")
    except Exception:
        supabase.storage.create_bucket(BUCKET_NAME, public=False)
        print(f"Bucket '{BUCKET_NAME}' criado.")


def upload_foto(supabase: Client, caminho: Path, storage_path: str) -> bool:
    """Faz upload de uma foto para o bucket privado."""
    try:
        with open(caminho, "rb") as f:
            supabase.storage.from_(BUCKET_NAME).upload(
                path=storage_path,
                file=f,
                file_options={"content-type": "image/jpeg", "upsert": "true"},
            )
        return True
    except Exception as e:
        if "already exists" in str(e).lower():
            return True
        print(f"    Erro no upload: {e}")
        return False


def registrar_no_banco(supabase: Client, storage_path: str, titulo: str, ordem: int):
    """Registra metadados da foto na tabela."""
    try:
        supabase.table("fotos").upsert(
            {
                "storage_path": storage_path,
                "titulo": titulo,
                "ordem": ordem,
            },
            on_conflict="storage_path",
        ).execute()
    except Exception as e:
        print(f"    Erro ao registrar: {e}")


def main():
    supabase = init_supabase()
    ensure_bucket(supabase)

    total = 0
    ordem = 0

    for pasta_nome, pasta_num in PASTAS:
        pasta_path = FOTOS_DIR / pasta_nome
        if not pasta_path.exists():
            print(f"\nPasta não encontrada: {pasta_nome}")
            continue

        imagens = sorted(pasta_path.glob("*.jpg")) + sorted(pasta_path.glob("*.jpeg")) + sorted(pasta_path.glob("*.png"))
        if not imagens:
            print(f"\n{pasta_nome}: sem imagens")
            continue

        print(f"\n=== {pasta_nome}: {len(imagens)} imagens ===")

        for i, img_path in enumerate(imagens, 1):
            ordem += 1
            storage_path = f"fotos/{img_path.name}"
            titulo = f"Foto {ordem:03d}"

            print(f"  [{i}/{len(imagens)}] {img_path.name}... ", end="", flush=True)

            ok = upload_foto(supabase, img_path, storage_path)
            if not ok:
                print("FALHA")
                continue

            registrar_no_banco(supabase, storage_path, titulo, ordem)
            total += 1
            print("OK")

    print(f"\nConcluído! {total} fotos enviadas.")


if __name__ == "__main__":
    main()
