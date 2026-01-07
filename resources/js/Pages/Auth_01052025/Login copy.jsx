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
            body.classList.add("christmas-theme");
            body.style.overflow = "hidden";

            const snowContainer = document.createElement("div");
            snowContainer.id = "snowContainer";
            snowContainer.style.position = "fixed";
            snowContainer.style.top = 0;
            snowContainer.style.left = 0;
            snowContainer.style.width = "100%";
            snowContainer.style.height = "100%";
            snowContainer.style.pointerEvents = "none";
            snowContainer.style.zIndex = 0;
            document.body.appendChild(snowContainer);

            const snowAccumulation = document.createElement("div");
            snowAccumulation.id = "snowAccumulation";
            snowAccumulation.style.position = "fixed";
            snowAccumulation.style.bottom = 0;
            snowAccumulation.style.left = 0;
            snowAccumulation.style.width = "100%";
            snowAccumulation.style.height = "0px";
            snowAccumulation.style.pointerEvents = "none";
            snowAccumulation.style.zIndex = 10;
            document.body.appendChild(snowAccumulation);

            let accumulationHeight = 0;
            const maxAccumulation = 120;
            const accumulationRate = 0.2;

            function updateSnowPile() {
                snowAccumulation.style.height = `${accumulationHeight}px`;
            }

            function createSnowflake() {
                const snowflake = document.createElement("div");
                snowflake.className = "snowflake";
                snowflake.textContent = Math.random() > 0.7 ? "⚪" : "❄";
                const size = 10 + Math.random() * 16;
                snowflake.style.fontSize = `${size}px`;
                snowflake.style.position = "fixed";
                snowflake.style.top = "-20px";
                snowflake.style.left = `${Math.random() * 100}vw`;
                snowflake.style.opacity = 0.3 + Math.random() * 0.5;
                snowflake.style.pointerEvents = "none";

                const duration = 6 + Math.random() * 4;
                snowContainer.appendChild(snowflake);

                setTimeout(() => {
                    snowflake.style.transition = `top ${duration}s linear, left ${duration}s linear`;
                    snowflake.style.top = "100vh";
                    snowflake.style.left = `${parseFloat(snowflake.style.left) + (Math.random() * 20 - 10)}vw`;
                }, 50);

                setTimeout(() => {
                    snowflake.remove();
                    if (accumulationHeight < maxAccumulation) {
                        accumulationHeight += accumulationRate;
                        updateSnowPile();
                    }
                }, duration * 1000);
            }

            const interval = setInterval(createSnowflake, 120);

            return () => {
                clearInterval(interval);
                snowContainer.remove();
                snowAccumulation.remove();
                body.style.overflow = "auto";
            };
        } else {
            body.classList.add("default-theme");
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
