import { useEffect, useState } from "react";
import { getEnquiry } from "../../pages/Enquiry/services/index";
import { FONTS } from "../../constants/constants";

interface EnquiryReply {
  fullName: string;
  yourEnquiry: string;
  replyMessage?: string;
  uuid: string;
  createdAt: string;
}

const ReplyMessageList = () => {
  const [replies, setReplies] = useState<EnquiryReply[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const response = await getEnquiry();
        const data = response?.data?.data;

        if (Array.isArray(data)) {
          setReplies(data);
        } else {
          console.error("Expected array but got:", data);
          setReplies([]);
        }
      } catch (error) {
        console.error("Failed to fetch replies", error);
        setReplies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReplies();
  }, []);

  console.log(replies)

  return (
    <div className="space-y-6">
      <h2
        style={{ ...FONTS.cardheader }}
        className="text-xl font-semibold text-[#006666]"
      >
        All Enquiries
      </h2>

      {loading && <div className="text-gray-500 text-sm">Loading...</div>}

      {!loading && replies.length === 0 && (
        <div className="text-gray-500 text-sm">No replies available.</div>
      )}

      <div className="flex flex-col space-y-4">
        {replies.map((item, index) => (
          <div
            key={index}
            className="relative w-full p-5 pb-12 bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300"
          >
        
            <div className="flex justify-between items-start mb-3">
              <p
                className="text-sm text-gray-500"
                style={{ ...FONTS.paragraph }}
              >
                Enquiry ID:
              </p>
              <p
                className="text-sm !text-white font-medium bg-purple-600 rounded-full px-2 w-32 text-center"
                style={{ ...FONTS.subParagraph }}
              >
                <span className="!text-white" style={{ ...FONTS.subParagraph }}>
                  Name:{" "}
                </span>
                {item?.fullName?.substring(0, 15)}
              </p>
            </div>

    
            <div className="mb-3">
              <p
                className="text-gray-700 break-words"
                style={{ ...FONTS.subParagraph }}
              >
                {item.uuid}
              </p>
            </div>

  
            <div className="mb-3">
              <p style={{ ...FONTS.paragraph }}>Enquiry:</p>
              <p
                className="text-gray-700 mt-2"
                style={{ ...FONTS.subParagraph }}
              >
                {item.yourEnquiry}
              </p>
            </div>
            <div>
              <p
                className="text-sm text-gray-500 mb-2"
                style={{ ...FONTS.paragraph }}
              >
                Reply:
              </p>
              <p
                style={{ ...FONTS.subParagraph, color: item?.replyMessage ? 'gray' : 'red' }}
              >
                {item?.replyMessage || "No reply yet"}
              </p>
            </div>
            <div className="absolute bottom-4 right-5 text-xs text-gray-500" style={{ ...FONTS.subParagraph }}>
             {new Date(item.createdAt).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                })}

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReplyMessageList;
