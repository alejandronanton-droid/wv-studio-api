const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

const pathProyectos = path.join(__dirname, 'proyectos.json');
const pathColores = path.join(__dirname, 'colores.json'); 
const pathRedes = path.join(__dirname, 'redes.json'); 
const pathInfo = path.join(__dirname, 'info.json');

// Puerta de enlace CORS Nativa e Infalible
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const defaultInfo = {
    textoDestacado: "Desafiando proporciones de forma matemática. Pensamos en grande, producimos en vertical.",
    textoManifiesto: "No creemos en los formatos rígidos. Creamos narrativas cinemáticas adaptadas a la velocidad del consumo digital. W&V opera desde Latam hacia el mundo.",
    logos: [
        "https://upload.wikimedia.org/wikipedia/commons/7/75/Sony_Music_logo.svg",
        "https://upload.wikimedia.org/wikipedia/commons/2/24/Adidas_logo.svg",
        "https://upload.wikimedia.org/wikipedia/commons/d/d2/Warner_Bros._Discovery_logo.svg"
    ],
    servicios: [
        { titulo: "Dirección & Idea", descripcion: "Guión, desarrollo de conceptos híbridos..." },
        { titulo: "Producción Rígida", descripcion: "Logística técnica de alta fidelidad..." },
        { titulo: "Post & VFX", descripcion: "Montaje rítmico acelerado por hardware..." },
        { titulo: "Diseño Cromático", descripcion: "Corrección cromática cinematográfica avanzada..." }
    ],
    crew: [
        { foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800", nombre: "Aleksander W.", cargo: "Director de Arte / Founder", bio: "Trayectoria audiovisual..." },
        { foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800", nombre: "Valentin V.", cargo: "Realizador VFX / Fullstack", bio: "Sistemas multimedia..." }
    ]
};

// Rutas de API
app.get('/api/info', (req, res) => {
    fs.readFile(pathInfo, 'utf8', (err, data) => {
        if (err) {
            fs.writeFile(pathInfo, JSON.stringify(defaultInfo, null, 2), () => {});
            return res.json(defaultInfo);
        }
        try {
            const parsed = JSON.parse(data || '{}');
            res.json({ ...defaultInfo, ...parsed });
        } catch(e) { res.json(defaultInfo); }
    });
});

app.post('/api/info', (req, res) => {
    fs.readFile(pathInfo, 'utf8', (err, data) => {
        let currentInfo = {};
        if (!err && data) { try { currentInfo = JSON.parse(data); } catch(e) {} }
        const newInfo = { ...defaultInfo, ...currentInfo, ...req.body };
        fs.writeFile(pathInfo, JSON.stringify(newInfo, null, 2), (writeErr) => {
            if (writeErr) return res.status(500).json({ error: "Error" });
            res.status(200).json({ success: true });
        });
    });
});

app.get('/api/redes', (req, res) => {
    fs.readFile(pathRedes, 'utf8', (err, data) => {
        if (err) return res.json({ instagram: "", behance: "", linkedin: "", twitter: "" });
        res.json(JSON.parse(data || '{}'));
    });
});
app.post('/api/redes', (req, res) => {
    fs.writeFile(pathRedes, JSON.stringify(req.body, null, 2), () => res.json({ success: true }));
});

app.get('/api/colores', (req, res) => {
    fs.readFile(pathColores, 'utf8', (err, data) => {
        if (err) return res.json([{ claro: "#FAF9F6", oscuro: "#1A1A1A" }]);
        res.json(JSON.parse(data || '[]'));
    });
});
app.post('/api/colores', (req, res) => {
    fs.writeFile(pathColores, JSON.stringify(req.body, null, 2), () => res.json({ success: true }));
});

app.get('/api/proyectos', (req, res) => {
    fs.readFile(pathProyectos, 'utf8', (err, data) => res.json(JSON.parse(data || '[]')));
});
app.post('/api/proyectos', (req, res) => {
    fs.readFile(pathProyectos, 'utf8', (err, data) => {
        let proy = []; if (!err && data) { try { proy = JSON.parse(data); } catch(e){} }
        proy.push(req.body);
        fs.writeFile(pathProyectos, JSON.stringify(proy, null, 2), () => res.json({ success: true }));
    });
});

// ? NUEVA RUTA: Eliminar pieza por su posición en el Array
app.delete('/api/proyectos/:index', (req, res) => {
    const index = parseInt(req.params.index, 10);
    fs.readFile(pathProyectos, 'utf8', (err, data) => {
        let proy = []; if (!err && data) { try { proy = JSON.parse(data); } catch(e){} }
        if (index >= 0 && index < proy.length) {
            proy.splice(index, 1); // Remueve la pieza seleccionada
            fs.writeFile(pathProyectos, JSON.stringify(proy, null, 2), (writeErr) => {
                if (writeErr) return res.status(500).json({ error: "Error de escritura" });
                res.json({ success: true });
            });
        } else {
            res.status(400).json({ error: "Índice fuera de rango" });
        }
    });
});

app.listen(PORT, () => console.log(`? Servidor W&V Listo en puerto: ${PORT}`));