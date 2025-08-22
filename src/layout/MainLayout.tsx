/* eslint-disable @typescript-eslint/no-explicit-any */
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import { COLORS } from '../constants/constants';
import SideBar from '../components/Sidebar/SideBar';
import Client from '../api/index';
import { useState } from 'react';
import { SocketProvider } from '../context/partnerSocket';

const MainLayout = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);

	const publicVapidKey = import.meta.env.VITE_PUBLIC_VAPI_KEY;

	function urlBase64ToUint8Array(base64String: string) {
		const padding = '='.repeat((4 - base64String.length % 4) % 4);
		const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
		const rawData = atob(base64);
		return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
	}

	if ('serviceWorker' in navigator && 'PushManager' in window) {
		navigator.serviceWorker.register('/ServiceWorker.js')
			.then(async (register: any) => {
				const sub = await register.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
				});
				await Client.partner.Subcription.post(sub);
			});
	}

	return (
		<SocketProvider role="partner">
			<div className="flex h-screen bg-gray-100 overflow-hidden">
				{/* Sidebar - fixed width */}
				<div
					className={`transition-all duration-300 p-0 ${
						isSidebarOpen ? 'w-[250px]' : 'w-[68px]'
					}`}
				>
					<SideBar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
				</div>

				{/* Main Content - flexible */}
				<div className="flex flex-col flex-grow overflow-hidden">
					<Navbar hasNewBooking={true} />
					<main className="flex-1 overflow-auto scrollbar-hide">
						<div
							className="p-2 rounded min-h-full"
							style={{ backgroundColor: COLORS.bgColor }}
						>
							<Outlet />
						</div>
					</main>
				</div>
			</div>
		</SocketProvider>
	);
};

export default MainLayout;
