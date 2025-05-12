const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const port = 3000;

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
app.use(express.json());

// إعداد Multer لتخزين الملفات
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // نضيف الوقت لتسمية الملفات بشكل فريد
    }
});

const upload = multer({ storage: storage });

// قاعدة بيانات مؤقتة لحفظ تفاصيل الصور
let images = [];

// المسار لرفع الصور
app.post('/upload', upload.single('image'), (req, res) => {
    const { name, device } = req.body;
    const newImage = {
        id: Date.now(),
        originalName: name,
        filename: req.file.filename,
        device: device
    };
    images.push(newImage);
    res.status(200).json({ success: true });
});

// المسار لاسترجاع الصور
app.get('/images', (req, res) => {
    res.json(images);
});

// المسار لحذف صورة
app.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
    const imageIndex = images.findIndex(img => img.id == id);
    if (imageIndex > -1) {
        const imageToDelete = images.splice(imageIndex, 1)[0]; // حذف الصورة من المصفوفة
        const filePath = path.join(__dirname, 'uploads', imageToDelete.filename);

        fs.unlink(filePath, (err) => {  // حذف الملف من المجلد  
            if (err) {  
                return res.status(500).json({ success: false, message: 'حدث خطأ أثناء حذف الصورة' });  
            }  
            res.json({ success: true });  
        });

    } else {
        res.status(404).json({ success: false, message: 'الصورة غير موجودة' });
    }
});

// المسار لتغيير اسم الصورة
app.post('/rename/:id', (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    const image = images.find(img => img.id == id);
    if (image) {
        // تغيير الاسم في المصفوفة
        image.originalName = name;

        // تغيير اسم الملف الفعلي في المجلد  
        const oldFilePath = path.join(__dirname, 'uploads', image.filename);  
        const newFileName = Date.now() + path.extname(image.filename);  // استخدام اسم جديد مع الوقت لضمان التميز  
        const newFilePath = path.join(__dirname, 'uploads', newFileName);  

        fs.rename(oldFilePath, newFilePath, (err) => {  
            if (err) {  
                return res.status(500).json({ success: false, message: 'حدث خطأ أثناء تغيير اسم الملف' });  
            }  
            image.filename = newFileName;  // تحديث اسم الملف في المصفوفة  
            res.json({ success: true });  
        });

    } else {
        res.status(404).json({ success: false, message: 'الصورة غير موجودة' });
    }
});

// تشغيل السيرفر
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
