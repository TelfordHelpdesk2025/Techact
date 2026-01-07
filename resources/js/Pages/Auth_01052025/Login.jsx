import { useForm, Head } from "@inertiajs/react";
import { useEffect } from "react";
import InputError from "@/Components/InputError";
import TextInput from "@/Components/TextInput";

export default function Login({ redirect }) {
    const { data, setData, post, processing, errors } = useForm({
        employeeID: "",
        password: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("login"));
    };

    // ---------- Christmas / Default Theme ----------
    useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();

    const start = new Date(`${year}-11-03T00:00:00`);
    const end = new Date(`${year + 1}-01-01T23:59:59`);

    const body = document.body;

    if (now >= start && now <= end) {
        // FORCE CHRISTMAS BACKGROUND
        body.style.cssText = `
            background: radial-gradient(circle at top, #0f2027, #203a43, #2c5364) !important;
            min-height: 100vh;
            overflow-x: hidden;
        `;

        const snowContainer = document.createElement("div");
        snowContainer.id = "snowContainer";
        Object.assign(snowContainer.style, {
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
        });
        document.body.appendChild(snowContainer);

        const snowAccumulation = document.createElement("div");
        snowAccumulation.id = "snowAccumulation";
        Object.assign(snowAccumulation.style, {
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "0px",
            background: "linear-gradient(to top, #fff, transparent)",
            pointerEvents: "none",
            zIndex: 5,
        });
        document.body.appendChild(snowAccumulation);

        let accumulationHeight = 0;

        function createSnowflake() {
            const snowflake = document.createElement("div");
            snowflake.textContent = Math.random() > 0.7 ? "❄" : "•";

            const size = 10 + Math.random() * 16;
            const duration = 6 + Math.random() * 4;

            Object.assign(snowflake.style, {
                position: "fixed",
                top: "-20px",
                left: `${Math.random() * 100}vw`,
                fontSize: `${size}px`,
                opacity: 0.3 + Math.random() * 0.5,
                pointerEvents: "none",
                transition: `top ${duration}s linear, left ${duration}s linear`,
            });

            snowContainer.appendChild(snowflake);

            setTimeout(() => {
                snowflake.style.top = "100vh";
                snowflake.style.left = `${parseFloat(snowflake.style.left) + (Math.random() * 20 - 10)}vw`;
            }, 50);

            setTimeout(() => snowflake.remove(), duration * 1000);
        }

        const interval = setInterval(createSnowflake, 120);

        return () => {
            clearInterval(interval);
            snowContainer.remove();
            snowAccumulation.remove();
            body.style.cssText = "";
        };
    }
}, []);


    // ---------- Music toggle ----------
    useEffect(() => {
        const music = document.getElementById("bgMusic");
        const unmuteBtn = document.getElementById("unmuteBtn");

        if (music && unmuteBtn) {
            unmuteBtn.addEventListener("click", () => {
                music.muted = !music.muted;
                unmuteBtn.querySelector("i").className = music.muted
                    ? "fas fa-volume-mute"
                    : "fas fa-volume-up";
            });
        }
    }, []);

    return (
        <>
            <Head title="Login" />

            <div className="flex flex-col lg:flex-row w-full h-screen items-center justify-center relative z-10">
                {/* LEFT SIDE */}
                <div className="flex-1 flex items-center justify-center text-center p-8 lg:p-12 relative">
                    <div className="floating">
                        <img
                            src="/images/1702174020__telford-logo1.jpg"
                            alt="Christmas Illustration"
                            className="max-w-xs md:max-w-md lg:max-w-lg drop-shadow-xl rounded-2xl border-4 border-white/20"
                        />
                        <h2 className="text-white mt-8 text-4xl md:text-5xl font-bold">
                            Merry Christmas!
                        </h2>
                        <p className="text-white/80 mt-2 text-lg">
                            Wishing you joy and cheer this season 🎅🎄
                        </p>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex-1 flex items-center justify-center w-full px-4 lg:px-12">
                    <div className="glass rounded-3xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden">
                        <div className="text-center mb-8 relative z-10">
                            <h1 className="authify-logo text-5xl font-bold text-white mb-2">
                                auth<span className="text-red-300">i</span>fy
                            </h1>
                            <p className="text-white/80 text-sm mt-2">
                                Secure Single Sign-On with holiday cheer
                            </p>
                        </div>

                        <InputError
                            message={errors.general}
                            className="py-2 mt-2 mb-4 font-medium text-center bg-red-100 rounded"
                        />

                        <form onSubmit={submit} className="space-y-5 relative z-10">
                            <input type="hidden" name="redirect" value={redirect} />

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-xl">🎅</span>
                                </div>
                                <TextInput
                                    id="employeeID"
                                    type="text"
                                    name="employeeID"
                                    value={data.employeeID}
                                    className="input-focus w-full pl-12 pr-4 py-3 bg-white/90 border border-gray-300 rounded-xl text-gray-800 text-xl"
                                    required
                                    autoFocus
                                    onChange={(e) => setData("employeeID", e.target.value)}
                                    placeholder="Employee ID"
                                />
                                <InputError message={errors.employeeID} className="mt-1" />
                            </div>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-xl">🎁</span>
                                </div>
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="input-focus w-full pl-12 pr-4 py-3 bg-white/90 border border-gray-300 rounded-xl text-gray-800 text-xl"
                                    required
                                    onChange={(e) => setData("password", e.target.value)}
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} className="mt-1" />
                            </div>

                            <button
    type="submit"
    disabled={processing}
    className={`w-full py-3.5 text-lg font-semibold rounded-xl flex items-center justify-center gap-2
        text-white bg-gradient-to-r from-green-400 to-red-500 
        hover:from-green-500 hover:to-red-600 
        shadow-lg shadow-red-500/50 transition-all duration-300
        ${processing ? "opacity-70 cursor-not-allowed" : ""}`}
>
    <i className="fas fa-snowflake animate-bounce text-white"></i>
    {processing ? "Logging in..." : "Login"}
</button>

                        </form>
                    </div>
                </div>

                {/* Background Music */}
                <audio id="bgMusic" autoPlay loop muted>
                    <source src="/images/christmas_audio.mp3" type="audio/mpeg" />
                </audio>
                <button
                    id="unmuteBtn"
                    className="fixed bottom-6 right-6 bg-white/20 backdrop-blur-md text-white px-4 py-3 rounded-full shadow-lg hover:bg-white/30 transition-all duration-300 z-50 flex items-center gap-2 border border-white/30"
                >
                    <i className="fas fa-volume-mute"></i>
                    <span>Tap to Unmute</span>
                </button>
            </div>
        </>
    );
}
