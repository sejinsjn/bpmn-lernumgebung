import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const StudentHome = () => {
    return (
        <div className="container text-center" style={{ marginTop: "20%" }}>
            <Link to="/uebung1">
                <button type="button" className="btn btn-primary btn-lg">
                    Übung 1
                </button>
            </Link>
            <Link to="/uebung3">
                <button type="button" className="btn btn-info btn-lg">
                    Übung 3
                </button>
            </Link>
        </div>
    );
};

export default StudentHome;
