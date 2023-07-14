import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StudentHome from "./pages/student/Home";
import Uebung1 from "./pages/student/Uebung1";
import Uebung2 from "./pages/student/Uebung2";
import Uebung3 from "./pages/student/Uebung3";
import TeacherHome from "./pages/teacher/Home";
import Editor from "./pages/teacher/Editor";
import Viewer from "./pages/teacher/Viewer";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/">
                    <Route index element={<StudentHome />} />
                    <Route path="uebung1" element={<Uebung1 />} />
                    <Route path="uebung2" element={<Uebung2 />} />
                    <Route path="uebung3" element={<Uebung3 />} />
                    <Route path="teacher" element={<TeacherHome />} />
                    <Route path="teacher/editor" element={<Editor />} />
                    <Route path="teacher/viewer" element={<Viewer />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
