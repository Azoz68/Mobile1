# الخطة التشغيلية للعام الدراسي ١٤٤٨هـ — إعادة تصميم عصرية

إعادة تصميم كاملة (24 شريحة) لعرض الخطة التشغيلية المدرسية بهوية وزارة التعليم الخضراء.

- **الملف النهائي:** `الخطة-التشغيلية-1448هـ.pptx` (خط Tajawal مضمّن داخل الملف)
- **معاينة:** `preview.pdf`

## إعادة البناء
```bash
cd src && npm install pptxgenjs react-icons react react-dom sharp
node assets.js   # يولّد الخلفيات والأيقونات في ../assets
node deck.js     # يولّد العرض في ../out/plan_1448.pptx
python3 embed_fonts.py ../out/plan_1448.pptx ../out/final.pptx  # تضمين الخطوط
```

الهوية: أخضر داكن `#095242` · تيل `#0089A1` · ذهبي `#C9A45C` · خط Tajawal (OFL).
