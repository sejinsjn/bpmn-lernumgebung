import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StudentHome from "./pages/student/Home";
import Uebung1 from "./pages/student/Uebung1";
import Uebung3 from "./pages/student/Uebung3";
import Loesung from "./pages/student/Loesung";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/">
                    <Route index element={<StudentHome />} />
                    <Route path="uebung1" element={<Uebung1 />} />
                    <Route path="uebung3" element={<Uebung3 />} />
                    <Route path="loesung" element={<Loesung />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
