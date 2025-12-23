import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";

export default function Profile({ profile, errors }) {
    const { props } = usePage();
    const successMessage = props.flash?.success;

    const [password, setPassword] = useState({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
    });

    const [passwordForm, setPasswordForm] = useState(false);

    const handleChangePassword = () => {
        router.post(
            route("changePassword"),
            { ...password },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Session-based logout
                    router.get(route("logout"), {}, {
                        onFinish: () => {
                            window.location.href = route("login");
                        },
                    });
                },
            }
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Profile" />

            <div className="max-w-3xl mx-auto mt-6 bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-2xl shadow-lg border border-gray-200">
                <h1 className="pb-3 mb-6 text-3xl font-bold text-gray-800 border-b-2 border-blue-200 flex items-center gap-2">
                    <i className="fas fa-user-circle text-blue-500 text-4xl"></i>
                    User Profile
                </h1>

                {profile && (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <ProfileField label="Name" value={profile.EMPNAME} />
                        <ProfileField label="Position" value={profile.JOB_TITLE} />
                        <ProfileField label="Department" value={profile.DEPARTMENT} />
                        <ProfileField label="Production Line" value={profile.PRODLINE} />
                        <ProfileField label="Station" value={profile.STATION} />
                        <ProfileField label="Email" value={profile.EMAIL} />

                        <div className="flex items-end gap-2 mt-2">
                            <ProfileField
                                label="Password"
                                value={[...Array(profile.PASSWRD?.length || 8)]
                                    .map(() => "•")
                                    .join("")}
                            />
                            <button
                                onClick={() => setPasswordForm(!passwordForm)}
                                className={`px-4 py-2 rounded-md text-sm font-semibold border transition-all duration-200 ${
                                    passwordForm
                                        ? "border-red-400 text-red-500 hover:bg-red-100"
                                        : "border-blue-400 text-blue-600 hover:bg-blue-100"
                                }`}
                            >
                                {passwordForm ? "Cancel" : "Change Password"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Password Change Section */}
                <div
                    className={`transition-all duration-500 ${
                        passwordForm ? "opacity-100 mt-8" : "opacity-0 h-0 overflow-hidden"
                    }`}
                >
                    <div className="p-5 space-y-5 bg-white rounded-xl border border-yellow-300 shadow-sm">
                        <div
                            role="alert"
                            className="flex items-center gap-3 text-sm text-yellow-700 bg-yellow-100 px-3 py-2 rounded-md"
                        >
                            <i className="fas fa-exclamation-triangle text-yellow-500 text-lg"></i>
                            <span>
                                Changing your password will log you out of all systems using
                                <strong> Authify</strong>.
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="old-password" value="Old Password" />
                                <TextInput
                                    id="old-password"
                                    type="password"
                                    value={password.current_password}
                                    className="block w-full mt-1"
                                    onChange={(e) =>
                                        setPassword({
                                            ...password,
                                            current_password: e.target.value,
                                        })
                                    }
                                />
                                <InputError
                                    message={errors.current_password}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="new-password" value="New Password" />
                                <TextInput
                                    id="new-password"
                                    type="password"
                                    value={password.new_password}
                                    className="block w-full mt-1"
                                    onChange={(e) =>
                                        setPassword({
                                            ...password,
                                            new_password: e.target.value,
                                        })
                                    }
                                />
                                <InputError
                                    message={errors.new_password}
                                    className="mt-1"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <InputLabel
                                    htmlFor="confirm-new-password"
                                    value="Confirm New Password"
                                />
                                <TextInput
                                    id="confirm-new-password"
                                    type="password"
                                    value={password.new_password_confirmation}
                                    className="block w-full mt-1"
                                    onChange={(e) =>
                                        setPassword({
                                            ...password,
                                            new_password_confirmation: e.target.value,
                                        })
                                    }
                                />
                                <InputError
                                    message={errors.new_password_confirmation}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <button
                            className="w-full py-2 mt-2 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-all"
                            onClick={handleChangePassword}
                        >
                            <i className="fas fa-key mr-2"></i>Change Password
                        </button>

                        {successMessage && (
                            <div className="flex items-center gap-2 p-3 mt-3 text-green-800 bg-green-100 rounded-md">
                                <i className="fas fa-check-circle text-green-600"></i>
                                <span>{successMessage}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function ProfileField({ label, value }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-500">{label}</label>
            <p className="mt-1 text-gray-800 font-semibold bg-white/70 px-3 py-2 rounded-md border border-gray-200 shadow-sm">
                {value || "—"}
            </p>
        </div>
    );
}
