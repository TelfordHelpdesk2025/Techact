import { useForm, Head } from "@inertiajs/react";
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

    return (
        <>
            <Head title="Login" />

            <div className="flex flex-col lg:flex-row w-full h-screen items-center justify-center bg-gradient-to-br from-gray-800 via-gray-600 to-blue-200">
                {/* LEFT SIDE */}
                <div className="flex-1 flex items-center justify-center text-center p-8 lg:p-12">
                    <div>
                        <img
                            src="/images/1702174020__telford-logo1.jpg"
                            // src="/images/ee_portal.svg"
                            alt="Illustration"
                            className="max-w-xs md:max-w-md lg:max-w-lg drop-shadow-xl rounded-2xl"
                            //  className="w-[550px] lg:w-[650px] xl:w-[750px] drop-shadow-xl rounded-2xl"
                            // className="w-full max-w-xl drop-shadow-xl rounded-2xl"
                        />

                        <h2 className="text-white mt-8 text-4xl md:text-5xl font-bold">
                            Welcome Back
                        </h2>

                        <p className="text-white/80 mt-2 text-lg">
                            Sign in to continue to your account
                        </p>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex-1 flex items-center justify-center w-full px-4 lg:px-12">
                    <div className="glass rounded-3xl shadow-4xl p-8 w-full max-w-md border-2 border-blue-700">
                        <div className="text-center mb-8">
                            <h1 className="authify-logo text-5xl font-bold text-white mb-2">
                                Auth<span className="text-red-800">i</span>fy
                            </h1>
                            <p className="text-gray-800 text-sm">
                                Secure Single Sign-On
                            </p>
                        </div>

                        <InputError
                            message={errors.general}
                            className="py-2 mt-2 mb-4 text-center bg-red-100 rounded"
                        />

                        <form onSubmit={submit} className="space-y-5">
                            <input type="hidden" name="redirect" value={redirect} />

                            {/* Employee ID */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                    <span className="text-xl">👤</span>
                                </div>
                                <TextInput
                                    id="employeeID"
                                    type="text"
                                    value={data.employeeID}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl text-xl text-gray-700"
                                    required
                                    autoFocus
                                    onChange={(e) =>
                                        setData("employeeID", e.target.value)
                                    }
                                    placeholder="Employee ID"
                                />
                                <InputError message={errors.employeeID} />
                            </div>

                            {/* Password */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                    <span className="text-xl">🔒</span>
                                </div>
                                <TextInput
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl text-xl text-gray-700"
                                    required
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className={`w-full py-3.5 rounded-xl text-lg font-semibold flex justify-center gap-2 text-white transition
                                    bg-indigo-600 hover:bg-indigo-700
                                    ${processing ? "opacity-70" : ""}
                                `}
                            >
                                <i className="fas fa-sign-in-alt" />
                                {processing ? "Logging in..." : "Login"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
