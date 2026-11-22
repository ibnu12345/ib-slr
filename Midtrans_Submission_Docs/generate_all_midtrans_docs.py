import os
import sys
import shutil

class SimplePDF:
    def __init__(self, filename):
        self.filename = filename
        self.width = 595.28  # A4 width in pt
        self.height = 841.89 # A4 height in pt
        self.stream_ops = []
        self.pages = []
        
    def new_page(self):
        if self.stream_ops:
            self.pages.append("\n".join(self.stream_ops))
            self.stream_ops = []

    def set_color(self, r, g, b, stroke=False):
        if stroke:
            self.stream_ops.append(f"{r:.3f} {g:.3f} {b:.3f} RG")
        else:
            self.stream_ops.append(f"{r:.3f} {g:.3f} {b:.3f} rg")

    def draw_line(self, x1, y1, x2, y2, width=1.0, r=0.2, g=0.2, b=0.2):
        self.set_color(r, g, b, stroke=True)
        self.stream_ops.append(f"{width} w {x1:.2f} {y1:.2f} m {x2:.2f} {y2:.2f} l S")

    def draw_rect(self, x, y, w, h, fill_rgb=None, stroke_rgb=None, width=1.0):
        if fill_rgb:
            self.set_color(fill_rgb[0], fill_rgb[1], fill_rgb[2], stroke=False)
        if stroke_rgb:
            self.set_color(stroke_rgb[0], stroke_rgb[1], stroke_rgb[2], stroke=True)
            self.stream_ops.append(f"{width} w")
            
        if fill_rgb and stroke_rgb:
            op = "B"
        elif fill_rgb:
            op = "f"
        elif stroke_rgb:
            op = "S"
        else:
            return
            
        self.stream_ops.append(f"{x:.2f} {y:.2f} {w:.2f} {h:.2f} re {op}")

    def escape_text(self, text):
        return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")

    def add_text(self, text, x, y, font="F1", size=10, rgb=(0.1, 0.1, 0.1)):
        self.set_color(rgb[0], rgb[1], rgb[2], stroke=False)
        escaped = self.escape_text(text)
        self.stream_ops.append(f"BT /{font} {size} Tf {x:.2f} {y:.2f} Td ({escaped}) Tj ET")

    def save(self):
        if self.stream_ops:
            self.pages.append("\n".join(self.stream_ops))
            self.stream_ops = []
            
        num_pages = len(self.pages)
        page_obj_ids = [3 + i for i in range(num_pages)]
        content_obj_ids = [3 + num_pages + i for i in range(num_pages)]
        font1_id = 3 + 2 * num_pages
        font2_id = font1_id + 1
        font3_id = font2_id + 1
        
        catalog = "<< /Type /Catalog /Pages 2 0 R >>"
        kids_str = " ".join([f"{pid} 0 R" for pid in page_obj_ids])
        pages_obj = f"<< /Type /Pages /Kids [{kids_str}] /Count {num_pages} >>"
        
        obj_table = {1: catalog, 2: pages_obj}
        
        for i in range(num_pages):
            pid = page_obj_ids[i]
            cid = content_obj_ids[i]
            page_dict = f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {self.width:.2f} {self.height:.2f}] /Contents {cid} 0 R /Resources << /Font << /F1 {font1_id} 0 R /F2 {font2_id} 0 R /F3 {font3_id} 0 R >> >> >>"
            obj_table[pid] = page_dict
            
            stream_data = self.pages[i].encode('latin-1', errors='replace')
            content_dict = f"<< /Length {len(stream_data)} >>\nstream\n" + self.pages[i] + "\nendstream"
            obj_table[cid] = content_dict
            
        obj_table[font1_id] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"
        obj_table[font2_id] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>"
        obj_table[font3_id] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>"
        
        total_objs = max(obj_table.keys())
        
        with open(self.filename, "wb") as f:
            f.write(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
            offsets = {}
            for oid in sorted(obj_table.keys()):
                offsets[oid] = f.tell()
                data = obj_table[oid]
                if isinstance(data, str):
                    data = data.encode('latin-1', errors='replace')
                f.write(f"{oid} 0 obj\n".encode('ascii') + data + b"\nendobj\n")
                
            xref_offset = f.tell()
            f.write(f"xref\n0 {total_objs + 1}\n".encode('ascii'))
            f.write(b"0000000000 65535 f \n")
            for oid in range(1, total_objs + 1):
                off = offsets.get(oid, 0)
                f.write(f"{off:010d} 00000 n \n".encode('ascii'))
                
            trailer = f"trailer\n<< /Size {total_objs + 1} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n"
            f.write(trailer.encode('ascii'))


def generate_katalog_pdf(output_path):
    pdf = SimplePDF(output_path)
    
    # Header Accent bar
    pdf.draw_rect(45, 785, 505, 5, fill_rgb=(0.184, 0.490, 0.471))
    
    # Brand title
    pdf.add_text("IB-SLR", 45, 755, font="F2", size=24, rgb=(0.090, 0.196, 0.302))
    pdf.add_text("Platform SaaS Systematic Literature Review: \"From Literature to Evidence.\"", 45, 740, font="F2", size=10, rgb=(0.184, 0.490, 0.471))
    
    # Metadata Right
    pdf.add_text("Website Resmi: https://ib-slr-app.vercel.app", 320, 758, font="F1", size=8.5, rgb=(0.4, 0.45, 0.5))
    pdf.add_text("Dokumen: Lampiran Onboarding Merchant Midtrans", 320, 746, font="F1", size=8.5, rgb=(0.4, 0.45, 0.5))
    pdf.add_text("Tanggal Terbit: November 2026", 320, 734, font="F1", size=8.5, rgb=(0.4, 0.45, 0.5))
    
    pdf.draw_line(45, 725, 550, 725, width=1.0, r=0.85, g=0.87, b=0.9)
    
    # Title Badge
    pdf.draw_rect(45, 700, 205, 16, fill_rgb=(0.937, 0.969, 0.965), stroke_rgb=(0.184, 0.490, 0.471), width=0.8)
    pdf.add_text("KATALOG PRODUK & LAYANAN RESMI", 52, 704, font="F2", size=8, rgb=(0.184, 0.490, 0.471))
    
    pdf.add_text("Katalog Produk, Layanan Digital & Struktur Tarif IB-SLR", 45, 678, font="F2", size=14, rgb=(0.06, 0.09, 0.16))
    
    # Description paragraph
    p1 = "IB-SLR adalah perangkat lunak berbasis cloud (Cloud Software as a Service / SaaS) yang dirancang"
    p2 = "khusus untuk memfasilitasi mahasiswa pascasarjana, dosen, klinisi, dan lembaga riset dalam"
    p3 = "menjalankan Systematic Literature Review (SLR), Meta-Analysis, dan Scoping Review berstandar"
    p4 = "internasional (PRISMA 2020 Statement dan Cochrane Handbook)."
    pdf.add_text(p1, 45, 660, font="F1", size=9.5, rgb=(0.25, 0.3, 0.35))
    pdf.add_text(p2, 45, 647, font="F1", size=9.5, rgb=(0.25, 0.3, 0.35))
    pdf.add_text(p3, 45, 634, font="F1", size=9.5, rgb=(0.25, 0.3, 0.35))
    pdf.add_text(p4, 45, 621, font="F1", size=9.5, rgb=(0.25, 0.3, 0.35))
    
    # Model Bisnis Callout Box
    pdf.draw_rect(45, 570, 505, 42, fill_rgb=(0.97, 0.98, 0.99), stroke_rgb=(0.8, 0.85, 0.9), width=0.8)
    pdf.draw_rect(45, 570, 4, 42, fill_rgb=(0.184, 0.490, 0.471))
    pdf.add_text("Model Bisnis & Penyerahan Produk (Digital Fulfillment):", 56, 598, font="F2", size=9, rgb=(0.09, 0.20, 0.30))
    box_p1 = "IB-SLR beroperasi dengan model Freemium Digital Subscription & Pay-Per-Project Token."
    box_p2 = "Seluruh penyerahan produk bersifat instan dan digital (zero physical shipping) melalui aktivasi kuota akun."
    pdf.add_text(box_p1, 56, 586, font="F1", size=8.5, rgb=(0.3, 0.35, 0.4))
    pdf.add_text(box_p2, 56, 575, font="F1", size=8.5, rgb=(0.3, 0.35, 0.4))
    
    # Section Title Table
    pdf.add_text("Daftar Paket Produk & Struktur Harga Resmi", 45, 545, font="F2", size=11, rgb=(0.09, 0.20, 0.30))
    pdf.draw_line(45, 538, 550, 538, width=0.8, r=0.8, g=0.85, b=0.9)
    
    # Table Header
    table_y = 515
    pdf.draw_rect(45, table_y, 505, 20, fill_rgb=(0.09, 0.20, 0.30))
    pdf.add_text("Nama Produk / Paket", 52, table_y + 6, font="F2", size=8.5, rgb=(1, 1, 1))
    pdf.add_text("Tarif Resmi", 175, table_y + 6, font="F2", size=8.5, rgb=(1, 1, 1))
    pdf.add_text("Fitur & Spesifikasi Layanan", 270, table_y + 6, font="F2", size=8.5, rgb=(1, 1, 1))
    pdf.add_text("Metode Pembayaran", 450, table_y + 6, font="F2", size=8.5, rgb=(1, 1, 1))
    
    # Row 1: Academic Free
    r1_y = 445
    pdf.draw_rect(45, r1_y, 505, 68, stroke_rgb=(0.88, 0.90, 0.92), width=0.5)
    pdf.add_text("Academic Free", 52, r1_y + 50, font="F2", size=9, rgb=(0.1, 0.15, 0.2))
    pdf.add_text("(Paket Dasar Riset)", 52, r1_y + 38, font="F1", size=7.5, rgb=(0.5, 0.55, 0.6))
    pdf.add_text("Rp 0", 175, r1_y + 50, font="F2", size=9, rgb=(0.184, 0.490, 0.471))
    pdf.add_text("(Gratis Selamanya)", 175, r1_y + 38, font="F1", size=7.5, rgb=(0.5, 0.55, 0.6))
    pdf.add_text("- 1 slot proyek aktif SLR lengkap", 270, r1_y + 52, font="F1", size=8, rgb=(0.25, 0.3, 0.35))
    pdf.add_text("- Import referensi (.RIS, BibTeX, CSV)", 270, r1_y + 40, font="F1", size=8, rgb=(0.25, 0.3, 0.35))
    pdf.add_text("- Deduplikasi otomatis artikel ganda", 270, r1_y + 28, font="F1", size=8, rgb=(0.25, 0.3, 0.35))
    pdf.add_text("- Diagram alir PRISMA 2020 realtime", 270, r1_y + 16, font="F1", size=8, rgb=(0.25, 0.3, 0.35))
    pdf.add_text("Aktivasi Otomatis", 450, r1_y + 45, font="F1", size=8, rgb=(0.3, 0.35, 0.4))
    pdf.add_text("saat Registrasi", 450, r1_y + 33, font="F1", size=8, rgb=(0.3, 0.35, 0.4))
    
    # Row 2: Pay-Per-Project Pass
    r2_y = 370
    pdf.draw_rect(45, r2_y, 505, 73, fill_rgb=(0.985, 0.99, 1.0), stroke_rgb=(0.88, 0.90, 0.92), width=0.5)
    pdf.add_text("Pay-Per-Project Pass", 52, r2_y + 55, font="F2", size=9, rgb=(0.09, 0.20, 0.30))
    pdf.add_text("SKU: PROJ-PASS-1X", 52, r2_y + 43, font="F1", size=7.5, rgb=(0.5, 0.55, 0.6))
    pdf.add_text("Rp 20.000", 175, r2_y + 55, font="F2", size=9.5, rgb=(0.184, 0.490, 0.471))
    pdf.add_text("per 1x proyek aktif", 175, r2_y + 43, font="F1", size=7.5, rgb=(0.5, 0.55, 0.6))
    pdf.add_text("(~$1.30 USD)", 175, r2_y + 31, font="F1", size=7.5, rgb=(0.5, 0.55, 0.6))
    pdf.add_text("- Buka +1 slot proyek SLR aktif permanen", 270, r2_y + 57, font="F1", size=8, rgb=(0.25, 0.3, 0.35))
    pdf.add_text("- Tanpa langganan bulanan (sekali bayar)", 270, r2_y + 45, font="F1", size=8, rgb=(0.25, 0.3, 0.35))
    pdf.add_text("- In-Browser PDF reader & pencatat sitasi", 270, r2_y + 33, font="F1", size=8, rgb=(0.25, 0.3, 0.35))
    pdf.add_text("- Ekspor matriks data lengkap Excel & Word", 270, r2_y + 21, font="F1", size=8, rgb=(0.25, 0.3, 0.35))
    pdf.add_text("Midtrans:", 450, r2_y + 52, font="F2", size=8, rgb=(0.09, 0.20, 0.30))
    pdf.add_text("QRIS (All E-Wallet),", 450, r2_y + 40, font="F1", size=7.5, rgb=(0.3, 0.35, 0.4))
    pdf.add_text("VA Bank (BCA, Mandiri,", 450, r2_y + 28, font="F1", size=7.5, rgb=(0.3, 0.35, 0.4))
    pdf.add_text("BRI, BNI)", 450, r2_y + 16, font="F1", size=7.5, rgb=(0.3, 0.35, 0.4))
    
    # Row 3: Professional Researcher
    r3_y = 295
    pdf.draw_rect(45, r3_y, 505, 73, stroke_rgb=(0.88, 0.90, 0.92), width=0.5)
    pdf.add_text("Professional Researcher", 52, r3_y + 55, font="F2", size=9, rgb=(0.09, 0.20, 0.30))
    pdf.add_text("SKU: PLAN-PRO-RES", 52, r3_y + 43, font="F1", size=7.5, rgb=(0.5, 0.55, 0.6))
    pdf.add_text("Rp 450.000", 175, r3_y + 55, font="F2", size=9.5, rgb=(0.184, 0.490, 0.471))
    pdf.add_text("per bulan (~$29 USD)", 175, r3_y + 43, font="F1", size=7.5, rgb=(0.5, 0.55, 0.6))
    pdf.add_text("- Unlimited proyek SLR aktif bersamaan", 270, r3_y + 57, font="F1", size=8, rgb=(0.25, 0.3, 0.35))
    pdf.add_text("- Dual-reviewer blinded screening & arbitrasi", 270, r3_y + 45, font="F1", size=8, rgb=(0.25, 0.3, 0.35))
    pdf.add_text("- Risk of Bias (Cochrane RoB 2, JBI, NOS)", 270, r3_y + 33, font="F1", size=8, rgb=(0.25, 0.3, 0.35))
    pdf.add_text("- Traffic light RoB chart otomatis", 270, r3_y + 21, font="F1", size=8, rgb=(0.25, 0.3, 0.35))
    pdf.add_text("Midtrans:", 450, r3_y + 52, font="F2", size=8, rgb=(0.09, 0.20, 0.30))
    pdf.add_text("QRIS, VA Bank,", 450, r3_y + 40, font="F1", size=7.5, rgb=(0.3, 0.35, 0.4))
    pdf.add_text("Kartu Kredit/Debit", 450, r3_y + 28, font="F1", size=7.5, rgb=(0.3, 0.35, 0.4))
    
    # Row 4: Institutional & Lab
    r4_y = 220
    pdf.draw_rect(45, r4_y, 505, 73, fill_rgb=(0.985, 0.99, 1.0), stroke_rgb=(0.88, 0.90, 0.92), width=0.5)
    pdf.add_text("Institutional & Lab", 52, r4_y + 55, font="F2", size=9, rgb=(0.09, 0.20, 0.30))
    pdf.add_text("SKU: PLAN-INST-LAB", 52, r4_y + 43, font="F1", size=7.5, rgb=(0.5, 0.55, 0.6))
    pdf.add_text("Rp 1.500.000", 175, r4_y + 55, font="F2", size=9.5, rgb=(0.184, 0.490, 0.471))
    pdf.add_text("per bulan (~$99 USD)", 175, r4_y + 43, font="F1", size=7.5, rgb=(0.5, 0.55, 0.6))
    pdf.add_text("- Unlimited seats tim riset & lab kampus", 270, r4_y + 57, font="F1", size=8, rgb=(0.25, 0.3, 0.35))
    pdf.add_text("- Multi-workspace manajemen lab", 270, r4_y + 45, font="F1", size=8, rgb=(0.25, 0.3, 0.35))
    pdf.add_text("- SAML SSO & Audit Log kepatuhan etika", 270, r4_y + 33, font="F1", size=8, rgb=(0.25, 0.3, 0.35))
    pdf.add_text("- Zero AI Model Training Guarantee", 270, r4_y + 21, font="F1", size=8, rgb=(0.25, 0.3, 0.35))
    pdf.add_text("Midtrans:", 450, r4_y + 52, font="F2", size=8, rgb=(0.09, 0.20, 0.30))
    pdf.add_text("Virtual Account Bank,", 450, r4_y + 40, font="F1", size=7.5, rgb=(0.3, 0.35, 0.4))
    pdf.add_text("Kartu Kredit, Transfer", 450, r4_y + 28, font="F1", size=7.5, rgb=(0.3, 0.35, 0.4))
    
    # Refund Box
    pdf.draw_rect(45, 145, 505, 55, fill_rgb=(0.99, 0.99, 0.96), stroke_rgb=(0.85, 0.8, 0.6), width=0.8)
    pdf.draw_rect(45, 145, 4, 55, fill_rgb=(0.79, 0.54, 0.04))
    pdf.add_text("Kebijakan Garansi & Pengembalian Dana (100% Refund Policy):", 56, 185, font="F2", size=8.5, rgb=(0.5, 0.35, 0.05))
    ref_p1 = "IB-SLR menyediakan garansi 100% refund dalam waktu 7 hari setelah transaksi jika terjadi kendala teknis"
    ref_p2 = "atau slot proyek pass belum pernah digunakan untuk proses seleksi artikel ilmiah."
    pdf.add_text(ref_p1, 56, 172, font="F1", size=8, rgb=(0.35, 0.25, 0.05))
    pdf.add_text(ref_p2, 56, 160, font="F1", size=8, rgb=(0.35, 0.25, 0.05))
    
    # Footer
    pdf.draw_line(45, 95, 550, 95, width=0.8, r=0.85, g=0.87, b=0.9)
    pdf.add_text("IB-SLR Platform  |  Hak Cipta (c) 2026. All rights reserved.", 45, 78, font="F1", size=8, rgb=(0.5, 0.55, 0.6))
    pdf.add_text("Email: contact@ib-slr.local / ibnusetiawan1928@gmail.com", 45, 66, font="F1", size=8, rgb=(0.5, 0.55, 0.6))
    pdf.add_text("Status: Midtrans Production Gateway Onboarding", 350, 78, font="F2", size=8, rgb=(0.184, 0.490, 0.471))
    pdf.add_text("URL: https://ib-slr-app.vercel.app", 350, 66, font="F1", size=8, rgb=(0.5, 0.55, 0.6))
    
    pdf.save()
    print(f"Katalog PDF generated: {output_path}")


def generate_kredensial_pdf(output_path):
    pdf = SimplePDF(output_path)
    
    # Header Accent bar
    pdf.draw_rect(45, 785, 505, 5, fill_rgb=(0.090, 0.196, 0.302))
    
    # Brand title
    pdf.add_text("IB-SLR", 45, 755, font="F2", size=24, rgb=(0.090, 0.196, 0.302))
    pdf.add_text("Platform SaaS Systematic Literature Review: \"From Literature to Evidence.\"", 45, 740, font="F2", size=10, rgb=(0.184, 0.490, 0.471))
    
    # Metadata Right
    pdf.add_text("Website Resmi: https://ib-slr-app.vercel.app", 320, 758, font="F1", size=8.5, rgb=(0.4, 0.45, 0.5))
    pdf.add_text("Dokumen: Dokumen Tambahan Akun Pengujian", 320, 746, font="F1", size=8.5, rgb=(0.4, 0.45, 0.5))
    pdf.add_text("Tujuan: Audit & Verifikasi Midtrans", 320, 734, font="F1", size=8.5, rgb=(0.4, 0.45, 0.5))
    
    pdf.draw_line(45, 725, 550, 725, width=1.0, r=0.85, g=0.87, b=0.9)
    
    # Title Badge
    pdf.draw_rect(45, 700, 240, 16, fill_rgb=(0.94, 0.96, 0.98), stroke_rgb=(0.09, 0.20, 0.30), width=0.8)
    pdf.add_text("DOKUMEN PENDUKUNG & AUDIT AKSES", 52, 704, font="F2", size=8, rgb=(0.09, 0.20, 0.30))
    
    pdf.add_text("Kredensial Akun Pengujian & Panduan Transaksi Midtrans", 45, 678, font="F2", size=13.5, rgb=(0.06, 0.09, 0.16))
    
    p1 = "Dokumen ini dilampirkan secara resmi untuk memenuhi formulir data tambahan merchant Midtrans."
    p2 = "Tim verifikator Midtrans dapat menggunakan kredensial akun di bawah ini untuk mengakses dashboard"
    p3 = "platform IB-SLR dan melakukan pengujian transaksi pembayaran (test transaction)."
    pdf.add_text(p1, 45, 660, font="F1", size=9.5, rgb=(0.25, 0.3, 0.35))
    pdf.add_text(p2, 45, 647, font="F1", size=9.5, rgb=(0.25, 0.3, 0.35))
    pdf.add_text(p3, 45, 634, font="F1", size=9.5, rgb=(0.25, 0.3, 0.35))
    
    # Credential Box
    pdf.add_text("1. Data Kredensial Akun Pengujian (Testing Credentials)", 45, 605, font="F2", size=11, rgb=(0.09, 0.20, 0.30))
    pdf.draw_line(45, 598, 550, 598, width=0.8, r=0.8, g=0.85, b=0.9)
    
    box_y = 475
    pdf.draw_rect(45, box_y, 505, 110, fill_rgb=(0.96, 0.97, 0.99), stroke_rgb=(0.75, 0.8, 0.88), width=1.0)
    
    pdf.add_text("Halaman Login Sistem :", 60, box_y + 85, font="F2", size=9.5, rgb=(0.1, 0.15, 0.25))
    pdf.draw_rect(220, box_y + 80, 290, 18, fill_rgb=(1, 1, 1), stroke_rgb=(0.8, 0.85, 0.9), width=0.6)
    pdf.add_text("https://ib-slr-app.vercel.app/login", 228, box_y + 85, font="F2", size=9, rgb=(0.184, 0.490, 0.471))
    
    pdf.add_text("Email Akun Tester :", 60, box_y + 60, font="F2", size=9.5, rgb=(0.1, 0.15, 0.25))
    pdf.draw_rect(220, box_y + 55, 290, 18, fill_rgb=(1, 1, 1), stroke_rgb=(0.8, 0.85, 0.9), width=0.6)
    pdf.add_text("pro@ib-slr.com", 228, box_y + 60, font="F2", size=9.5, rgb=(0.09, 0.20, 0.30))
    
    pdf.add_text("Kata Sandi (Password) :", 60, box_y + 35, font="F2", size=9.5, rgb=(0.1, 0.15, 0.25))
    pdf.draw_rect(220, box_y + 30, 290, 18, fill_rgb=(1, 1, 1), stroke_rgb=(0.8, 0.85, 0.9), width=0.6)
    pdf.add_text("ProPass123!", 228, box_y + 35, font="F2", size=9.5, rgb=(0.09, 0.20, 0.30))
    
    pdf.add_text("Peran & Hak Akses :", 60, box_y + 10, font="F2", size=9.5, rgb=(0.1, 0.15, 0.25))
    pdf.draw_rect(220, box_y + 5, 290, 18, fill_rgb=(1, 1, 1), stroke_rgb=(0.8, 0.85, 0.9), width=0.6)
    pdf.add_text("Standard Researcher User (Akun Aktif)", 228, box_y + 10, font="F1", size=9, rgb=(0.3, 0.35, 0.4))
    
    # Alternatif Register Box
    pdf.draw_rect(45, 415, 505, 42, fill_rgb=(0.99, 0.99, 0.95), stroke_rgb=(0.88, 0.85, 0.7), width=0.8)
    pdf.add_text("Opsi Registrasi Mandiri:", 56, 442, font="F2", size=8.5, rgb=(0.5, 0.35, 0.05))
    reg_p1 = "Tim verifikator juga dapat mendaftarkan akun baru secara langsung via tautan:"
    reg_p2 = "https://ib-slr-app.vercel.app/register menggunakan alamat email tim verifikator Midtrans."
    pdf.add_text(reg_p1, 56, 430, font="F1", size=8, rgb=(0.35, 0.25, 0.05))
    pdf.add_text(reg_p2, 56, 420, font="F2", size=8, rgb=(0.184, 0.490, 0.471))
    
    # Step by Step Guide
    pdf.add_text("2. Panduan Langkah Pengujian Transaksi (Step-by-Step Test Flow)", 45, 385, font="F2", size=11, rgb=(0.09, 0.20, 0.30))
    pdf.draw_line(45, 378, 550, 378, width=0.8, r=0.8, g=0.85, b=0.9)
    
    steps = [
        ("Langkah 1: Akses & Login ke Sistem", 
         "Buka peramban dan kunjungi https://ib-slr-app.vercel.app/login.",
         "Masukkan email: pro@ib-slr.com dan password: ProPass123!, lalu klik tombol 'Masuk ke Akun'."),
        ("Langkah 2: Menuju Halaman Paket Pembayaran / Top-Up",
         "Setelah masuk ke Dashboard, klik menu 'Pricing' pada navigasi atas atau tombol 'Top Up Project Pass'",
         "pada kartu kuota proyek di halaman utama."),
        ("Langkah 3: Pemilihan Paket & Klik Tombol Bayar",
         "Pilih paket yang diinginkan, misalnya 'Pay-Per-Project Pass (Rp 20.000)' atau 'Professional Researcher',",
         "lalu tekan tombol 'Beli Sekarang' / 'Top Up'."),
        ("Langkah 4: Pengujian Modal Gateway Midtrans Snap",
         "Jendela pop-up antarmuka resmi Midtrans Snap / QRIS akan muncul secara otomatis di layar.",
         "Tim verifikator dapat meninjau channel pembayaran aktif (QRIS, VA Bank BCA/Mandiri/BRI/BNI, dll).")
    ]
    
    cur_y = 350
    for title, desc1, desc2 in steps:
        pdf.draw_rect(45, cur_y - 2, 8, 8, fill_rgb=(0.184, 0.490, 0.471))
        pdf.add_text(title, 60, cur_y, font="F2", size=9, rgb=(0.09, 0.20, 0.30))
        pdf.add_text(desc1, 60, cur_y - 12, font="F1", size=8, rgb=(0.25, 0.3, 0.35))
        pdf.add_text(desc2, 60, cur_y - 22, font="F1", size=8, rgb=(0.25, 0.3, 0.35))
        cur_y -= 38
        
    # Footer
    pdf.draw_line(45, 95, 550, 95, width=0.8, r=0.85, g=0.87, b=0.9)
    pdf.add_text("IB-SLR Platform  |  Hak Cipta (c) 2026. All rights reserved.", 45, 78, font="F1", size=8, rgb=(0.5, 0.55, 0.6))
    pdf.add_text("Email Kontak: contact@ib-slr.local / ibnusetiawan1928@gmail.com", 45, 66, font="F1", size=8, rgb=(0.5, 0.55, 0.6))
    pdf.add_text("Tujuan: Midtrans Production Onboarding Audit", 350, 78, font="F2", size=8, rgb=(0.09, 0.20, 0.30))
    pdf.add_text("URL: https://ib-slr-app.vercel.app", 350, 66, font="F1", size=8, rgb=(0.5, 0.55, 0.6))
    
    pdf.save()
    print(f"Kredensial PDF generated: {output_path}")

if __name__ == "__main__":
    docs_dir = r"C:\Users\ADVAN\Music\IB-SLR\Midtrans_Submission_Docs"
    desktop_dir = r"C:\Users\ADVAN\Desktop"
    downloads_dir = r"C:\Users\ADVAN\Downloads"
    
    f1 = os.path.join(docs_dir, "Katalog_Produk_Layanan_IBSLR.pdf")
    f2 = os.path.join(docs_dir, "Kredensial_Akun_Pengujian_Midtrans_IBSLR.pdf")
    
    generate_katalog_pdf(f1)
    generate_kredensial_pdf(f2)
    
    # Also copy to Desktop and Downloads so user can immediately find them!
    for target_dir in [desktop_dir, downloads_dir]:
        if os.path.exists(target_dir):
            try:
                shutil.copy(f1, target_dir)
                shutil.copy(f2, target_dir)
                print(f"Copied PDFs to: {target_dir}")
            except Exception as e:
                print(f"Could not copy to {target_dir}: {e}")
