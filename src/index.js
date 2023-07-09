import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Uebung1 from "./pages/Uebung1";
import Uebung2 from "./pages/Uebung2";
import Uebung3 from "./pages/Uebung3";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/">
                    <Route index element={<Home />} />
                    <Route path="uebung1" element={<Uebung1 />} />
                    <Route path="uebung2" element={<Uebung2 />} />
                    <Route path="uebung3" element={<Uebung3 />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
