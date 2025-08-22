import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS, FONTS } from '../../constants/constants';
import { useAuth } from '../../pages/auth/AuthContext';
// import { motion, AnimatePresence } from 'framer-motion';
// import booking from '../../assets/New Booking.png'
import bell from '../../assets/Notification.svg'
import { getProfile } from '../../pages/SettingsPage/services';
import { getNotificationsByUser, markNotificationsAsRead } from '../../pages/Notificationspages/Services';
import { useSocket } from '../../context/partnerSocket';
// import Avatar from "../../assets/Partner_Avatar.jpg"


interface User {
	firstName: string;
	lastName: string;
	companyName: string;
	contact_info: {
		phoneNumber: string;
		city: string;
		state: string;
	}
	is_active: boolean
	email: string;
	image: string;
	role: string;
	location: string;
	joinDate: string;
	status: string;
}

interface Notification {
	id: number;
	_id: string;
	message: string;
	created_at: string;
	is_read: boolean;
	priority: string;
	action_type: string;
	title: string;
	is_active: boolean;
	uuid: string;
	recipient_type: string;
	type: string;
}

type Props = {
	hasNewBooking: boolean;
};

const Navbar: React.FC<Props> = () => {
	const [isBellActive, setIsBellActive] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [showProfileDetails, setShowProfileDetails] = useState(false);
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
	const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);
	const [showNotifications, setShowNotifications] = useState(false);
	const navigate = useNavigate();
	const dropdownRef = useRef<HTMLDivElement | null>(null);
	const notificationRef = useRef<HTMLDivElement | null>(null);
	const modalRef = useRef<HTMLDivElement | null>(null);
	const { logout } = useAuth();
	const [notifications, setNotifications] = useState<Notification[]>([]);

	const [editedUser, setEditedUser] = useState<User>();
	const socket = useSocket();

	const fetchProfile = async () => {
		const Profile: any = await getProfile("");
		console.log("Profile", Profile)
		setEditedUser(Profile?.data?.data)
	}

	useEffect(() => {
		fetchProfile()
	}, [])

	// 🔁 Handle outside clicks for dropdown & notifications
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			) {
				setIsDropdownOpen(false);
			}
			if (
				notificationRef.current &&
				!notificationRef.current.contains(e.target as Node)
			) {
				setShowNotifications(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	// 🔁 Handle outside clicks for modal
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
				setShowProfileDetails(false);
			}
		};
		if (showProfileDetails) {
			document.addEventListener('mousedown', handleClickOutside);
		}
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [showProfileDetails]);

	const handleBellClick = () => {
		setIsBellActive(true);
		setShowNotifications((prev) => !prev);
		setTimeout(() => setIsBellActive(false), 150);
	};

	const handleViewAllNotifications = () => {
		setShowNotifications(false);
		navigate('/notifications');
	};

	const toggleDropdown = () => {
		setIsDropdownOpen((prev) => !prev);
	};


	const unreadCount = notifications?.filter((n) => !n.is_read).length;

	const filteredNotifications = notifications?.filter((m) => {
		if (m.recipient_type !== 'partner' && m.recipient_type !== 'all') return false;
		return m
	});


	useEffect(() => {
		const fetchNotifications = async () => {
			try {
				const userId: any = localStorage.getItem('PartnerId')
				const response: any = await getNotificationsByUser(userId);
				setNotifications(response?.data?.data?.notifications);
			} catch (error) {
				console.log("Error fetching notifications:", error);
			}
		};
		fetchNotifications();
	}, []);

	useEffect(() => {
		if (!socket) return;

		socket.on("newNotification", (notification: Notification) => {
			console.log("New notification received from socket:", notification);

			setNotifications((prev) => [notification, ...prev].slice(0, 5));
		});

		return () => {
			socket.off("newNotification");
		};
	}, [socket]);

	const getDateLabel = (isoDateStr: string): string => {
		const inputDate = new Date(isoDateStr);
		const today = new Date();
		const yesterday = new Date();
		yesterday.setDate(today.getDate() - 1);

		const isSameDay = (d1: Date, d2: Date): boolean =>
			d1.getDate() === d2.getDate() &&
			d1.getMonth() === d2.getMonth() &&
			d1.getFullYear() === d2.getFullYear();

		const time = inputDate.toLocaleTimeString("en-IN", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		});

		if (isSameDay(inputDate, today)) return `Today at ${time}`;
		if (isSameDay(inputDate, yesterday)) return `Yesterday at ${time}`;

		const date = inputDate.toLocaleDateString("en-IN", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});

		return `${date} at ${time}`;
	};

	const notifyHandle = async (n: Notification) => {
		try {
			if (!n.is_read) {
				await markNotificationsAsRead((n.uuid))
				if (n.type === 'assignService') {
					await navigate('/service')
				} else {
					await navigate('/announcement')
				}
				setNotifications((prev) => prev.map((m) => m._id === n._id ? { ...m, is_read: true } : m))
			} else if (n.type === 'assignService') {
				await navigate('/service')
			} else {
				await navigate('/announcement')
			}
			setShowNotifications(false)
		} catch (error) {
			console.error(error)
		}
	}


	return (
		<>
			<nav
				style={{ backgroundColor: COLORS.primary_01, height: '65px' }}
				className='flex items-center  px-4'
			>
				{/* search  */}
				<div className='flex items-center gap-2 '>
					<input
						type='text'
						placeholder='Search...'
						className='bg-white border ml-4  rounded-full px-6 py-2 text-sm focus:outline-none focus:ring-2  transition-all md:max-w-80'
						style={{ width: '450px', height: '45px' }}
					/>
					<button
						type='submit'
						className='bg-white rounded-full p-3 hover:scale-105 transition-transform'
					>
						<svg
							className='w-4 h-4 text-[#7812A4]'
							fill='none'
							stroke='currentColor'
							strokeWidth={3}
							strokeLinecap='round'
							strokeLinejoin='round'
							viewBox='0 0 24 24'
						>
							<path d='M21 21l-4.35-4.35M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z' />
						</svg>
					</button>
				</div>

				{/* Booking & notification */}
				<div className='ml-auto flex items-center space-x-4 md:space-x-2 pr-4'>
					{/* booking */}
					<div
						className='ml-2 relative rounded-full p-2 hover:scale-105 transition-transform cursor-pointer '
						onClick={() => navigate('/bookings')}
					>
						{/* <FaTools className='w-4 h-4 text-white' /> */}
						{/* <img
							src={booking}
							alt=''
							style={{ width: '35px', height: '35px' }}
						/> */}
						{/* <AnimatePresence>
							{hasNewBooking && (
								<motion.div
									key='new-bookings'
									initial={{ scale: 0 }}
									animate={{ scale: [1, 1.1, 1] }}
									exit={{ scale: 0 }}
									transition={{
										duration: 1.5,
										repeat: Infinity,
										ease: 'easeInOut',
									}}
									className='absolute -top-1 -left-0 px-1 py-0.4 text-[8px] font-semibold bg-white text-[#7812A4] rounded-full shadow-md whitespace-nowrap'
								
								>
									New Bookings
								</motion.div>
							)}
						</AnimatePresence> */}
					</div>


					{/* notification */}
					<div className='relative' ref={notificationRef}>
						<button
							aria-label='Notifications'
							onClick={handleBellClick}
							className={`relative p-2.5 rounded-full bg-white focus:outline-none transform transition-transform duration-200 ease-in-out ${isBellActive ? 'scale-90' : 'scale-100'
								}`}
						>
							<img src={bell}
								style={{ width: '20px', height: '20px' }} />

							{unreadCount > 0 && (
								<span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full'>
									{unreadCount}
								</span>
							)}
						</button>


						{showNotifications && (
							<div className='absolute right-0 mt-2 w-80 rounded-lg shadow-xl bg-white z-50 overflow-hidden'>
								<div className='bg-white  p-3'>
									<h3 className='text-gray-600 font-bold'>Notifications</h3>
								</div>
								<div className='max-h-80 overflow-y-auto'>

									{filteredNotifications.length > 0 ? (
										filteredNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((notification) => (
											<div
											    onClick={()=> notifyHandle(notification)}
												key={notification.id}
												className={`group relative p-3 border-b hover:bg-gray-50 transition-colors duration-150 ${notification.is_read ? 'bg-white' : 'bg-red-50'
													}`}
											>
												{/* This vertical red line will now appear on hover */}
												<div className='absolute left-0 top-0 h-full w-1 bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200'></div>

												<div className='flex justify-between items-start cursor-pointer'>
													<p className='text-sm text-gray-800'>
														{notification.title}
													</p>
													{!notification.is_read && (
														<span className='w-2 h-2 rounded-full bg-red-600 mt-1 ml-2'></span>
													)}
												</div>
												<p className='text-xs text-gray-500 mt-1 cursor-pointer'>
													{getDateLabel(notification.created_at)}
												</p>
											</div>
										))
									) : (
										<p className='p-3 text-gray-500 text-sm'>
											No notifications
										</p>
									)}
								</div>
								<div className='p-3 bg-gray-50 text-center border-t'>
									<button
										onClick={handleViewAllNotifications}
										className='text-[#7812A4] font-medium text-sm transition-colors'
									>
										View All Notifications
									</button>
								</div>
							</div>
						)}
					</div>

					<div className='relative' ref={dropdownRef}>
						<div
							onClick={toggleDropdown}
							className='flex items-center space-x-3 cursor-pointer'
						>
							<div className='w-12 h-12 rounded-full overflow-hidden'>
								<img
									src={editedUser?.image}
									alt={editedUser?.companyName}
									className='w-full h-full object-cover'
								/>
							</div>
							<div className='flex flex-col'>
								<span className='text-[white] font-medium'>
									{editedUser?.companyName}
								</span>
								<div className='flex items-center text-sm text-[white]'>
									Partner
									<svg
										className='w-4 h-6 ml-1 text-[white]'
										fill='none'
										stroke='currentColor'
										strokeWidth={2}
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											d='M19 9l-7 7-7-7'
										/>
									</svg>
								</div>
							</div>
						</div>

						{isDropdownOpen && (
							<div className='absolute right-0 mt-2 w-24 rounded-md shadow-lg z-50 bg-gradient-to-br from-yellow-50 to-yellow-100'>
								<ul className='py-1 text-sm text-[#7812A4]'>
									<li>
										<button
											onClick={() => {
												setShowProfileDetails(true);
												setIsDropdownOpen(false);
											}}
											className='block w-full text-center px-4 py-1 transition-colors duration-200 hover:text-white hover:bg-[#7812A4]'
										>
											Profile
										</button>
									</li>
									<li>
										<button
											onClick={() => {
												setShowLogoutConfirm(true);
												setIsDropdownOpen(false);
											}}
											className='block w-full text-center px-4 py-1 transition-colors duration-200 hover:text-white hover:bg-[#7812A4]'
										>
											Logout
										</button>
									</li>
								</ul>
							</div>
						)}
					</div>
				</div>
			</nav>

			{/* Profile Modal  */}
			{showProfileDetails && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4'>
					<div
						ref={modalRef}
						className='bg-[#FAF3EB] rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-xl sm:max-w-md overflow-hidden'
					>
						<div className='bg-gradient-to-r from-[#7812A4] to-[#7812A4] p-6 flex items-center justify-between !text-white'>
							<div className='flex items-center space-x-4'>
								<img
									src={editedUser?.image}
									alt='User'
									className='w-20 h-20 rounded-full border-4 border-white shadow-md'
								/>
								<div>
									<h2 className='text-2xl !text-white font-bold' style={{ ...FONTS.cardheader }}>{editedUser?.firstName + " " + editedUser?.lastName}</h2>
									<p className='text-sm opacity-90 !text-white' style={{ ...FONTS.cardSubHeader }}>{editedUser?.companyName}</p>
								</div>
							</div>
							<button
								onClick={() => setShowProfileDetails(false)}
								className='bg-[#FAF3EB] text-red-600 font-semibold p-2 rounded-lg shadow hover:bg-[#f8e0b0] transition'
								aria-label='Close profile details'
							>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-6 w-6'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'
									strokeWidth={2}
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										d='M6 18L18 6M6 6l12 12'
									/>
								</svg>
							</button>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-2 gap-6 p-6 !text-gray-700' style={{ ...FONTS.paragraph }}>
							<div className='space-y-3'>
								{['phone', 'email', 'location'].map((field) => {
									let value = '';

									if (field === 'phone') value = editedUser?.contact_info?.phoneNumber || '-';
									else if (field === 'email') value = editedUser?.email || '-';
									else if (field === 'location') value = `${editedUser?.contact_info?.city || ''}, ${editedUser?.contact_info?.state || ''}`.trim();

									return (
										<div key={field}>
											<h4 className='text-sm !text-gray-500' style={{ ...FONTS.paragraph }}>
												{field.charAt(0).toUpperCase() + field.slice(1)}
											</h4>
											<p className='text-lg' style={{ ...FONTS.tableHeader }}>
												{value}
											</p>
										</div>
									);
								})}
							</div>
							<div className='space-y-3'>
								{['role', 'joinDate', 'status'].map((field) => {
									let displayValue = '';

									if (field === 'role') {
										displayValue = 'Partner';
									} else if (field === 'joinDate') {
										const joinDate = (editedUser as any)?.created_at || (editedUser as any)?.joinDate || (editedUser as any)?.createdAt;
										if (joinDate) {
											try {
												const date = new Date(joinDate);
												displayValue = date.toLocaleDateString('en-US', {
													year: 'numeric',
													month: 'long',
													day: 'numeric'
												});
											} catch {
												displayValue = '-';
											}
										} else {
											displayValue = '-';
										}
									} else if (field === 'status') {
										displayValue = editedUser?.is_active === true ? "Active" : "In Active";
									}

									return (
										<div key={field}>
											<h4 className='text-sm !text-gray-500' style={{ ...FONTS.paragraph }}>
												{field === 'joinDate'
													? 'Join Date'
													: field.charAt(0).toUpperCase() + field.slice(1)}
											</h4>
											{field === 'status' ? (
												<span className='inline-block px-3 py-1 text-sm rounded-full bg-green-100 text-green-700'>
													{displayValue}
												</span>
											) : (
												<p className='text-lg' style={{ ...FONTS.tableHeader }}>
													{displayValue}
												</p>
											)}
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Logout Confirmation Modal */}
			{showLogoutConfirm && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]'>
					<div className='bg-white rounded-xl shadow-lg w-80 p-6 space-y-4 text-center'>
						<h2 className='text-lg font-semibold text-[#7812A4]'>
							Are you sure you want to logout?
						</h2>
						<div className='flex justify-center gap-4 mt-4'>
							<button
								onClick={() => setShowLogoutConfirm(false)}
								className='px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800'
							>
								Cancel
							</button>
							<button
								onClick={() => {
									setShowLogoutConfirm(false);
									setShowLogoutSuccess(true);
									setTimeout(() => {
										setShowLogoutSuccess(false);
										logout();
										navigate('/');
									}, 1000);
								}}
								className='px-4 py-2 rounded-full bg-[#7812A4] text-white '
							>
								OK
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Logout Success Modal */}
			{showLogoutSuccess && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]'>
					<div className='bg-white rounded-xl shadow-xl w-80 p-6 flex flex-col items-center space-y-4 text-center animate-fade-in'>
						{/* Animated Checkmark with Tailwind */}
						<svg
							className='w-16 h-16 text-green-600 animate-draw-check'
							viewBox='0 0 52 52'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<circle
								cx='26'
								cy='26'
								r='25'
								stroke='currentColor'
								strokeWidth='2'
								className='stroke-current'
							/>
							<path
								d='M14 27L22 35L38 19'
								stroke='currentColor'
								strokeWidth='4'
								strokeLinecap='round'
								strokeLinejoin='round'
								className='animate-draw-path'
							/>
						</svg>
						<p className='text-green-700 text-lg font-semibold'>
							Logout Successfully!
						</p>
					</div>

					{/* Tailwind custom animation via <style> tag (works well for small scoped styles) */}
					<style>
						{`
        @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }

        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }

        @keyframes draw-path {
            from { stroke-dasharray: 48; stroke-dashoffset: 48; }
            to { stroke-dashoffset: 0; }
        }

        .animate-draw-path {
            stroke-dasharray: 48;
            stroke-dashoffset: 48;
            animation: draw-path 0.5s ease-out forwards;
        }

        @keyframes draw-check {
            from { stroke-dasharray: 166; stroke-dashoffset: 166; }
            to { stroke-dashoffset: 0; }
        }

        .animate-draw-check circle {
            stroke-dasharray: 166;
            stroke-dashoffset: 166;
            animation: draw-check 0.6s ease-out forwards;
        }
    `}
					</style>
				</div>
			)}
		</>
	);
};

export default Navbar;
