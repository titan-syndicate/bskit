import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Greet } from "../wailsjs/go/main/App";

// Import components from the old Next.js app
import { ApplicationLayout } from './components/application-layout';
import { SidebarLayout } from './components/sidebar-layout';
import { Navbar } from './components/navbar';
import { Sidebar } from './components/sidebar';

function App() {
    const [resultText, setResultText] = useState("Please enter your name below 👇");
    const [name, setName] = useState('');
    const updateName = (e: any) => setName(e.target.value);
    const updateResultText = (result: string) => setResultText(result);

    function greet() {
        Greet(name).then(updateResultText);
    }

    return (
        <Router>
            <Routes>
                <Route path="/" element={
                    <ApplicationLayout>
                        <SidebarLayout
                            sidebar={<Sidebar />}
                            navbar={<Navbar />}
                        >
                            <div id="App">
                                <div id="result" className="result">{resultText}</div>
                                <div id="input" className="input-box">
                                    <input id="name" className="input" onChange={updateName} autoComplete="off" name="input" type="text" />
                                    <button className="btn" onClick={greet}>Greet</button>
                                </div>
                            </div>
                        </SidebarLayout>
                    </ApplicationLayout>
                } />
                {/* Add more routes here as needed */}
            </Routes>
        </Router>
    );
}

export default App;
