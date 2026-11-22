import os
import sys

class SimplePDF:
    def __init__(self, filename, title="Document"):
        self.filename = filename
        self.title = title
        self.width = 595.28  # A4 width in pt (72 dpi)
        self.height = 841.89 # A4 height in pt
        self.margin_x = 45.0
        self.current_y = 795.0
        self.stream_ops = []
        self.pages = [] # list of streams
        
    def new_page(self):
        if self.stream_ops:
            self.pages.append("\n".join(self.stream_ops))
            self.stream_ops = []
        self.current_y = 795.0

    def set_color(self, r, g, b, stroke=False):
        if stroke:
            self.stream_ops.append(f"{r:.3f} {g:.3f} {b:.3f} RG")
        else:
            self.stream_ops.append(f"{r:.3f} {g:.3f} {b:.3f} rg")

    def draw_line(self, x1, y1, x2, y2, width=1.0, r=0.2, g=0.2, b=0.2):
        self.set_color(r, g, b, stroke=True)
        self.stream_ops.append(f"{width} w {x1:.2f} {y1:.2f} m {x2:.2f} {y2:.2f} l S")

    def draw_rect(self, x, y, w, h, fill_rgb=None, stroke_rgb=None, width=1.0):
        op = ""
        if fill_rgb:
            self.set_color(fill_rgb[0], fill_rgb[1], fill_rgb[2], stroke=False)
            op += "f"
        if stroke_rgb:
            self.set_color(stroke_rgb[0], stroke_rgb[1], stroke_rgb[2], stroke=True)
            self.stream_ops.append(f"{width} w")
            op = "B" if fill_rgb else "S"
        if op:
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
            
        objects = []
        
        # 1: Catalog
        # 2: Pages
        # 3..: Page objects
        # then Page Content streams
        # then Fonts: F1 (Helvetica), F2 (Helvetica-Bold), F3 (Helvetica-Oblique)
        num_pages = len(self.pages)
        page_obj_ids = [3 + i for i in range(num_pages)]
        content_obj_ids = [3 + num_pages + i for i in range(num_pages)]
        font1_id = 3 + 2 * num_pages
        font2_id = font1_id + 1
        font3_id = font2_id + 1
        
        catalog = "<< /Type /Catalog /Pages 2 0 R >>"
        kids_str = " ".join([f"{pid} 0 R" for pid in page_obj_ids])
        pages_obj = f"<< /Type /Pages /Kids [{kids_str}] /Count {num_pages} >>"
        
        obj_table = {}
        obj_table[1] = catalog
        obj_table[2] = pages_obj
        
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

print("SimplePDF class defined")
