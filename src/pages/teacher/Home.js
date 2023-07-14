import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Home = () => {
    return (
        <div className="container text-center" style={{ marginTop: "20%" }}>
            <Link to="/teacher/viewer">
                <button type="button" className="btn btn-primary btn-lg">
                    BPMN-Viewer
                </button>
            </Link>
            <Link to="/teacher/editor">
                <button type="button" className="btn btn-success btn-lg">
                    BPMN-Editor
                </button>
            </Link>
            <Link to="/createtask">
                <button type="button" className="btn btn-info btn-lg">
                    Erstelle Übung
                </button>
            </Link>
        </div>
    );
};

export default Home;
