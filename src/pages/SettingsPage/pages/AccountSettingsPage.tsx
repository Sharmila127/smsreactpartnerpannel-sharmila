import React, { useEffect, useState } from "react";
import { BsFillPersonPlusFill } from "react-icons/bs";
import { MdOutlineDriveFileRenameOutline } from "react-icons/md";
// import { LiaBirthdayCakeSolid } from "react-icons/lia";
// import { BiMaleFemale } from "react-icons/bi";
// import { HiMiniInformationCircle } from "react-icons/hi2";
// import { CgProfile } from "react-icons/cg";
import { PiPhonePlusFill } from "react-icons/pi";
// import { RiContactsBook3Fill } from "react-icons/ri";
import { MdAttachEmail } from "react-icons/md";
import { FaCircleUser, FaMapLocationDot } from "react-icons/fa6";
import { FaRegAddressCard } from "react-icons/fa";
import { TbBuildingWarehouse } from "react-icons/tb";
// import { IoIosLink } from "react-icons/io";
// import { IoShareSocial } from "react-icons/io5";
import { getProfile, updateProfile } from "../services";
import { FONTS } from "../../../constants/constants";

const AccountSettingsPage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response: any = await getProfile("");
        console.log("Fetched Profile:", response.data.data);
        setProfile(response.data.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response: any = await updateProfile(profile);

      if (response) {
        setProfile(response);
      }
    } catch (error) {
      console.error("Error updating profile", error);
    }
  };

  return (
    <div className="p-6 mx-auto bg-white shadow-lg rounded-lg">
      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Personal Information Section */}
        <section className="space-y-6">
          <div
            className="flex items-center gap-2  border-b pb-2"
            style={{ ...FONTS.cardSubHeader }}
          >
            <BsFillPersonPlusFill />
            <h2>Personal Information</h2>
          </div>
          <section className="flex items-center gap-10  flex-col">

            <div className="w-1/7]">
              <div style={{ ...FONTS.paragraph }}>

                <div className="flex justify-center items-center border rounded-lg bg-gray-50 w-48 h-24">

                  <img
                    src={profile?.image}
                    alt={profile?.companyName}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>



          </section>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div style={{ ...FONTS.paragraph }}>
              <label
                htmlFor="partnerId"
                className=" mb-2 font-medium text-gray-700 flex items-center gap-2"
              >
                <FaCircleUser /> Partner ID
              </label>
              <input
                type="text"
                id="partnerId"
                value={profile?.id || ""}
                readOnly
                className="w-full px-4 py-2 !text-gray-700 border rounded-lg bg-gray-50 outline-none focus:outline-none focus:ring-0"
              />
            </div>
            <div style={{ ...FONTS.paragraph }}>
              <label
                htmlFor="companyName"
                className=" mb-2 font-medium !text-gray-700 flex items-center gap-2"
              >
                <TbBuildingWarehouse /> Company Name
              </label>
              <input
                type="text"
                id="companyName"
                value={profile?.companyName || ""}
                readOnly
                onChange={(e) =>
                  setProfile({ ...profile, companyName: e.target.value })
                }
                className="w-full px-4 py-2 !text-gray-700 border rounded-lg bg-gray-50 outline-none focus:outline-none focus:ring-0"
              />
            </div>

            <div style={{ ...FONTS.paragraph }}>
              <label
                htmlFor="firstName"
                className="mb-2 font-medium !text-gray-700 flex items-center gap-2"
              >
                <MdOutlineDriveFileRenameOutline /> First Name
              </label>
              <input
                type="text"
                id="firstName"
                value={profile?.firstName || ""}
                readOnly
                onChange={(e) =>
                  setProfile({ ...profile, firstName: e.target.value })
                }
                className="w-full px-4 py-2 !text-gray-700 border rounded-lg bg-gray-50 outline-none focus:outline-none focus:ring-0 "
              />
            </div>


            <div style={{ ...FONTS.paragraph }}>
              <label
                htmlFor="lastName"
                className=" mb-2 font-medium text-gray-700 flex items-center gap-2"
              >
                <MdOutlineDriveFileRenameOutline /> Last Name
              </label>
              <input
                type="text"
                id="lastName"
                value={profile?.lastName || ""}
                readOnly
                onChange={(e) =>
                  setProfile({ ...profile, lastName: e.target.value })
                }
                className="w-full px-4 py-2 !text-gray-700 border rounded-lg bg-gray-50 outline-none focus:outline-none focus:ring-0"
              />
            </div>






            <div style={{ ...FONTS.paragraph }}>
              <label
                htmlFor="email"
                className=" mb-2 font-medium text-gray-700 flex items-center gap-2"
              >
                <MdAttachEmail /> Email Address
              </label>
              <input
                type="email"
                id="email"
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                value={profile?.email || ""}
                readOnly
                className="w-full px-4 py-2 !text-gray-700 border rounded-lg bg-gray-50 outline-none focus:outline-none focus:ring-0"
              />
            </div>

            <div style={{ ...FONTS.paragraph }}>
              <label
                htmlFor="phone"
                className=" mb-2 font-medium text-gray-700 flex items-center gap-2"
              >
                <PiPhonePlusFill />
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    contact_info: {
                      ...profile.contact_info,
                      phoneNumber: e.target.value,
                    },
                  })
                }
                value={profile?.contact_info?.phoneNumber || ""}
                readOnly
                className="w-full px-4 py-2 !text-gray-700 border rounded-lg bg-gray-50 outline-none focus:outline-none focus:ring-0"
              />
            </div>

            <div style={{ ...FONTS.paragraph }}>
              <label
                htmlFor="address"
                className=" mb-2 font-medium text-gray-700 flex items-center gap-2"
              >
                <FaRegAddressCard /> Address1
              </label>
              <input
                type="text"
                id="address"
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    contact_info: {
                      ...profile.contact_info,
                      address1: e.target.value,
                    },
                  })
                }
                value={profile?.contact_info?.address1 || ""}

                readOnly
                className="w-full px-4 py-2 !text-gray-700 border rounded-lg bg-gray-50 outline-none focus:outline-none focus:ring-0"
              />
            </div>
            <div style={{ ...FONTS.paragraph }}>
              <label
                htmlFor="address2"
                className=" mb-2 font-medium text-gray-700 flex items-center gap-2"
              >
                <FaRegAddressCard /> Address 2
              </label>
              <input
                type="text"
                id="address2"
                value={profile?.contact_info?.address2 || ""}
                readOnly
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    contact_info: {
                      ...profile.contact_info,
                      address2: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2 !text-gray-700 border rounded-lg bg-gray-50 outline-none focus:outline-none focus:ring-0"
              />
            </div>

             <div style={{ ...FONTS.paragraph }}>
              <label className="mb-2 font-medium text-gray-700 flex items-center gap-2">
                <FaMapLocationDot /> State
              </label>
              <input
                type="text"
                value={profile?.contact_info?.state || ""}
                readOnly
                className="w-full px-4 py-2 !text-gray-700 border rounded-lg bg-gray-50 outline-none focus:outline-none focus:ring-0"
              />
            </div>

            <div style={{ ...FONTS.paragraph }}>
              <label
                htmlFor="city"
                className=" mb-2 font-medium text-gray-700 flex items-center gap-2"
              >
                <FaMapLocationDot /> City
              </label>
              <input
                type="text"
                id="city"
                value={profile?.contact_info?.city || ""}
                readOnly
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    contact_info: {
                      ...profile.contact_info,
                      city: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2 !text-gray-700 border rounded-lg bg-gray-50 outline-none focus:outline-none focus:ring-0"
              />
            </div>


           
            <div style={{ ...FONTS.paragraph }}>
              <label
                htmlFor="pincode"
                className=" mb-2 font-medium text-gray-700 flex items-center gap-2"
              >
                <FaRegAddressCard /> PINCODE
              </label>
              <input
                type="text"
                id="pincode"
                value={profile?.contact_info?.pincode || ""}
                readOnly
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    contact_info: {
                      ...profile.contact_info,
                      pincode: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2 !text-gray-700 border rounded-lg bg-gray-50 outline-none focus:outline-none focus:ring-0"
              />
            </div>

            <div style={{ ...FONTS.paragraph }}>
              <label
                htmlFor="regNo"
                className=" mb-2 font-medium text-gray-700 flex items-center gap-2"
              >
                <FaRegAddressCard /> Registration Number
              </label>
              <input
                type="text"
                id="regNo"
                value={profile?.regNo || ""}
                readOnly
                onChange={(e) =>
                  setProfile({ ...profile, regNo: e.target.value })
                }
                className="w-full px-4 py-2 !text-gray-700 border rounded-lg bg-gray-50 outline-none focus:outline-none focus:ring-0"
              />
            </div>




            <div style={{ ...FONTS.paragraph }}>
              <label
                htmlFor="aadhar"
                className=" mb-2 font-medium text-gray-700 flex items-center gap-2"
              >
                <FaRegAddressCard /> Aadhar Number
              </label>
              <input
                type="text"
                id="aadhar"
                value={profile?.aadhar || ""}
                readOnly
                onChange={(e) =>
                  setProfile({ ...profile, aadhar: e.target.value })
                }
                className="w-full px-4 py-2 !text-gray-700 border rounded-lg bg-gray-50 outline-none focus:outline-none focus:ring-0"
              />
            </div>



            <div style={{ ...FONTS.paragraph }}>
              <label
                htmlFor="pan"
                className=" mb-2 font-medium text-gray-700 flex items-center gap-2"
              >
                <FaRegAddressCard /> PAN Number
              </label>
              <input
                type="text"
                id="pan"
                value={profile?.pan || ""}
                readOnly
                onChange={(e) =>
                  setProfile({ ...profile, pan: e.target.value })
                }
                className="w-full px-4 py-2 !text-gray-700 border rounded-lg bg-gray-50 outline-none focus:outline-none focus:ring-0"
              />
            </div>

            <div style={{ ...FONTS.paragraph }}>
              <label
                htmlFor="gstNo"
                className=" mb-2 font-medium text-gray-700 flex items-center gap-2"
              >
                <TbBuildingWarehouse /> GST Number
              </label>
              <input
                type="text"
                id="gstNo"
                value={profile?.gstNo || ""}
                readOnly
                onChange={(e) =>
                  setProfile({ ...profile, gstNo: e.target.value })
                }
                className="w-full px-4 py-2 !text-gray-700 border rounded-lg bg-gray-50 outline-none focus:outline-none focus:ring-0"
              />
            </div>





          </div>
        </section>





        <div className="flex justify-end gap-4 pt-4">
          {/* <button
            type="button"
            className="px-6 py-2 border border-[#7812A4] rounded-full font-medium !text-[#7812A4] hover:bg-gray-50 transition"
            style={{ ...FONTS.paragraph }}
          >
            Cancel
          </button> */}
          {/* <button
            type="submit"
            className="px-6 py-2 bg-[#7812A4] !text-white rounded-full "
            style={{ ...FONTS.paragraph }}
          >
            Save Changes
          </button> */}
        </div>
      </form>
    </div>
  );
};

export default AccountSettingsPage;

