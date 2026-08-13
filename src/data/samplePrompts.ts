import { ConsumerMode } from '../types';

export interface SamplePrompt {
  id: string;
  mode: ConsumerMode;
  category: string;
  label: string;
  text: string;
  riskExpectation: 'STOP' | 'CAUTION' | 'VERIFY' | 'NO_CLEAR_RISK';
  description: string;
}

export const SAMPLE_PROMPTS: SamplePrompt[] = [
  {
    id: 'vcb_sms_scam',
    mode: 'message',
    category: 'SMS Giả mạo',
    label: 'SMS Vietcombank giả mạo link',
    text: 'Vietcombank thong bao: Tai khoan ngan hang cua ban da bi tam khoa do nghi van giao dich la. Vui long truy cap https://vietcombank-dinhdanh-online.com/xacthuc va nhap ma OTP ngay de huy lenh khoa.',
    riskExpectation: 'STOP',
    description: 'Giả mạo ngân hàng Vietcombank sử dụng tên miền vietcombank-dinhdanh-online.com yêu cầu nhập OTP.'
  },
  {
    id: 'vneid_apk_scam',
    mode: 'link',
    category: 'Link Độc hại',
    label: 'Link VNeID cài tệp .APK',
    text: 'Cổng Dịch vụ công Quốc gia VNeID thông báo: Hồ sơ định danh điện tử Mức 2 của ông/bà bị sai sót thông tin cư trú. Vui lòng truy cập ngay http://103.21.244.5/vneid.apk để tải ứng dụng cập nhật chuẩn hóa.',
    riskExpectation: 'STOP',
    description: 'Bẫy lừa cài đặt ứng dụng APK nguồn ngoài chứa mã độc điều khiển điện thoại từ xa.'
  },
  {
    id: 'police_investigation_call',
    mode: 'call',
    category: 'Cuộc gọi đe dọa',
    label: 'Giả danh Công an dọa bắt giữ',
    text: 'Cuộc gọi xưng là Đại úy Nguyễn Văn Hùng - Phòng Cảnh sát Điều tra Công an TP.HCM thông báo tôi đang dính líu đến đường dây rửa tiền xuyên quốc gia trị giá 12 tỷ đồng. Yêu cầu tôi không được cúp máy, giữ bí mật tuyệt đối và chuyển toàn bộ 80 triệu tiền tiết kiệm vào tài khoản tạm giữ của Viện Kiểm sát để xác minh.',
    riskExpectation: 'STOP',
    description: 'Giả danh cơ quan công an/tòa án đe dọa, yêu cầu chuyển tiền vào tài khoản tạm giữ.'
  },
  {
    id: 'debt_extortion_threat_sms',
    mode: 'threat',
    category: 'Đe dọa đòi nợ',
    label: 'Tin nhắn đe dọa khủng bố người thân',
    text: 'NGƯỜI THÂN NGƯỜI NHÀ, GIA ĐÌNH CỦA Nguyễn V.A LÔI ĐẦU NÓ RA ĐÂY GIẢI QUYẾT GẤP ĐI ĐỪNG BAO CHE NÓ MÀ LÀM ẢNH HƯỞNG ĐẾN DANH DỰ, UY TÍN VÀ MIẾNG CƠM MANH ÁO CỦA GIA ĐÌNH. CÔNG VIỆC, CHỖ LÀM VIỆC. A KHÔNG BỎ QUA CHO GĐ E ĐÂU LIÊN HỆ GẤP SẼ ĐƯỢC HỖ TRỢ .SĐT/ZL: 0349429664',
    riskExpectation: 'STOP',
    description: 'Hành vi tin nhắn đe dọa, uy hiếp danh dự, bôi nhọ uy tín công việc và gia đình.'
  },
  {
    id: 'shopee_job_scam',
    mode: 'message',
    category: 'Việc làm online',
    label: 'Tuyển cộng tác viên xem Shopee/TikTok',
    text: 'Tuyển cộng tác viên xử lý đơn hàng Shopee/TikTok tại nhà. Lương 300k - 800k/ngày, nhận tiền ngay sau 15 phút. Bạn chỉ cần nạp 200.000đ làm tiền ký quỹ mua đơn mẫu lần 1 để mở tài khoản VIP nhận hoa hồng 20%.',
    riskExpectation: 'CAUTION',
    description: 'Mô hình lừa đảo nhiệm vụ nạp tiền hoa hồng tăng dần không cho rút.'
  },
  {
    id: 'account_scam_mismatch',
    mode: 'account',
    category: 'Tài khoản nhận tiền',
    label: 'STK Ngân hàng cá nhân nhận tiền mua xe',
    text: 'Tôi chuẩn bị chuyển tiền mua xe máy giá rẻ từ một người bán online trên Facebook. Người bán yêu cầu chuyển cọc 5.000.000đ vào Số tài khoản: 190382910293 - Ngân hàng Techcombank - Chủ tài khoản: NGUYEN VAN A. Người bán hứa giao xe tận nhà trong ngày.',
    riskExpectation: 'VERIFY',
    description: 'Yêu cầu chuyển tiền đặt cọc xe/hàng hóa qua tài khoản cá nhân không giao dịch trực tiếp.'
  },
  {
    id: 'bank_official_safe',
    mode: 'message',
    category: 'An toàn chính thức',
    label: 'SMS Vietcombank biến động số dư xịn',
    text: 'Vietcombank thong bao: So du tai khoan 0071000xxxx thay doi +500.000 VND vao 14:20. Tra cuu giao dich tai ung dung VCB Digibank hoac website chinh thuc www.vietcombank.com.vn',
    riskExpectation: 'NO_CLEAR_RISK',
    description: 'Tin nhắn thông báo số dư chính thức dẫn về tên miền chuẩn www.vietcombank.com.vn.'
  },
  {
    id: 'electricity_bill_call',
    mode: 'call',
    category: 'Cuộc gọi hối thúc',
    label: 'Tổng đài Điện lực dọa cắt điện',
    text: 'Cuộc gọi tự động thông báo: Tổng công ty Điện lực thông báo gia đình bạn còn nợ 3.450.000đ tiền điện chưa thanh toán. Điện lực sẽ tiến hành cắt điện trong 2 giờ tới. Vui lòng bấm phím 9 để gặp tổng đài viên và nạp tiền khẩn cấp.',
    riskExpectation: 'STOP',
    description: 'Giả danh điện lực hối thúc dọa cắt điện ngay lập tức để ép chuyển tiền khẩn.'
  },
  {
    id: 'lottery_winner_scam',
    mode: 'message',
    category: 'Bẫy trúng thưởng',
    label: 'Tin nhắn trúng thưởng Xe xe máy Honda',
    text: 'Chúc mừng thuê bao 098****321 đã may mắn trúng giải Nhất chương trình Tri ân Khách hàng gồm 01 xe máy SH 125i và 100 triệu đồng tiền mặt. Vui lòng truy cập http://tri-an-honda2026.com để làm thủ tục nhận giải và nạp 2.000.000đ thẻ cào phí vận chuyển.',
    riskExpectation: 'STOP',
    description: 'Lừa đảo trúng thưởng yêu cầu nạp tiền/thẻ cào đóng phí nhận quà.'
  },
  {
    id: 'foreign_shipment_customs',
    mode: 'call',
    category: 'Cuộc gọi lừa đảo',
    label: 'Hải quan giữ bưu phẩm quà tặng nước ngoài',
    text: 'Nhân viên công ty chuyển phát nhanh quốc tế gọi điện báo có bưu phẩm gửi từ Anh Quốc chứa 50.000 USD và đồ trang sức đắt tiền gửi cho tôi nhưng đang bị Hải quan sân bay Tân Sơn Nhất tạm giữ. Yêu cầu chuyển 15 triệu tiền phạt thông quan vào tài khoản cá nhân.',
    riskExpectation: 'STOP',
    description: 'Chiêu trò bẫy tình cảm / gửi quà tặng nước ngoài bị phạt hải quan.'
  },
  {
    id: 'deepfake_family_accident',
    mode: 'call',
    category: 'Cuộc gọi khẩn cấp',
    label: 'Giọng nói con cái cấp cứu bệnh viện',
    text: 'Cuộc gọi từ số lạ nhưng giọng nói rất giống con trai tôi nói đang bị tai nạn giao thông chấn thương sọ não cấp cứu tại Bệnh viện Chợ Rẫy. Bác sĩ yêu cầu gia đình chuyển gấp 30 triệu tiền viện phí đóng tạm ứng để lên bàn mổ ngay.',
    riskExpectation: 'STOP',
    description: 'Lừa đảo giả giọng người thân gặp nạn khẩn cấp đánh vào tâm lý hoảng loạn.'
  },
  {
    id: 'mb_brand_fake_domain',
    mode: 'link',
    category: 'SMS Giả mạo',
    label: 'Link MBBank nhận tiền vay ưu đãi',
    text: 'MBBank: Hồ sơ vay vốn 100 triệu của bạn đã được phê duyệt thành công với lãi suất 0.5%/tháng. Vui lòng hoàn tất giải ngân tại https://mbbank-giaingan247.net và đóng 1.000.000đ phí bảo hiểm khoản vay.',
    riskExpectation: 'STOP',
    description: 'Giả mạo MBBank với tên miền mbbank-giaingan247.net không thuộc sở hữu chính thức.'
  },
  {
    id: 'vneid_official_safe',
    mode: 'link',
    category: 'An toàn chính thức',
    label: 'Tra cứu Cổng Dịch vụ công Quốc gia chuẩn',
    text: 'Bạn có thể tra cứu thông tin hồ sơ thủ tục hành chính và nộp hồ sơ trực tuyến tại Cổng Dịch vụ công Quốc gia địa chỉ chính thức https://dichvucong.gov.vn',
    riskExpectation: 'NO_CLEAR_RISK',
    description: 'Link Cổng Dịch vụ công Quốc gia chuẩn với đuôi .gov.vn của Chính phủ.'
  },
  {
    id: 'loan_app_icls',
    mode: 'message',
    category: 'Vay tín dụng đen',
    label: 'Tin nhắn mời vay tiền không thế chấp',
    text: 'Hỗ trợ vay tín chấp từ 10tr - 100tr không cần thế chấp, không duyệt hồ sơ, giải ngân trong 5 phút. Chỉ cần chụp ảnh CCCD 2 mặt gửi Zalo 0912xxx888. Lãi suất ưu đãi 1%/năm.',
    riskExpectation: 'CAUTION',
    description: 'Bẫy vay app tín dụng đen, lãi suất ẩn cao ngất ngưởng và lộ thông tin CCCD.'
  },
  {
    id: 'qr_pay_store_swap',
    mode: 'screenshot_qr',
    category: 'Ảnh / Mã QR',
    label: 'Mã QR thanh toán cửa hàng nghi bị dán đè',
    text: 'Mã QR chuyển tiền tại quầy thu ngân cửa hàng tiện lợi. Khi quét QR hiển thị thông tin STK: 9999888877 - Ngân hàng BIDV - CĐT: NGUYEN VAN B. Cần đối soát xem có phải tài khoản chính thức của cửa hàng không.',
    riskExpectation: 'VERIFY',
    description: 'Trường hợp tráo mã QR thanh toán tại cửa hàng mua sắm.'
  },
  {
    id: 'recovery_entered_otp',
    mode: 'recovery',
    category: 'Xử lý khẩn cấp',
    label: 'Tôi đã lỡ bấm link và nhập OTP ngân hàng',
    text: 'Tôi vừa truy cập vào một trang web giả mạo ngân hàng và đã nhập tên đăng nhập, mật khẩu cùng mã OTP gửi về điện thoại. Ngay sau đó tôi nhận được thông báo tài khoản bị trừ 20 triệu đồng. Tôi cần làm gì ngay bây giờ?',
    riskExpectation: 'STOP',
    description: 'Tình huống người dùng đã lỡ lộ OTP và bị chiếm đoạt tài khoản cần ứng phó khẩn.'
  }
];

export function getRandomSamplePrompt(excludeText?: string): SamplePrompt {
  const available = excludeText
    ? SAMPLE_PROMPTS.filter(p => p.text !== excludeText)
    : SAMPLE_PROMPTS;
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}
