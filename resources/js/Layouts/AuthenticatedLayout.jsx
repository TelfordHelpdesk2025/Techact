import NavBar from "@/Components/NavBar";
import Sidebar from "@/Components/Sidebar/SideBar";
import LoadingScreen from "@/Components/LoadingScreen";
import { usePage, router } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function AuthenticatedLayout({ header, children }) {
    const { props } = usePage();
    const { emp_data } = props; // Get emp_data from Inertia shared props

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        authCheck();
    }, [props]);

    const authCheck = () => {
        // If emp_data or emp_id doesn't exist, redirect to login
        if (!emp_data || !emp_data.emp_id) {
            router.visit(route("login")); // recommended with Inertia
            return;
        }

        setIsLoading(false); // session exists, stop loading
    };

    if (isLoading) {
        return <LoadingScreen text="Please wait..." />;
    }

    return (
        <div className="flex flex-col">
            <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <div className="w-full">
                    <NavBar />
                    <main className="h-screen px-6 py-6 pb-[70px] overflow-y-auto">
                        <div className="">{children}</div>
                    </main>
                </div>
            </div>
        </div>
    );
}
