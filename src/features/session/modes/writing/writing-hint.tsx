"use client";

/** Nội dung gợi ý dàn bài mode viết — port nguyên văn từ writing-session-view. */
export function WritingHint() {
  return (
    <div>
      <div className="mb-1 font-bold">
        💡 Gợi ý cấu trúc viết email hội nghị chuẩn:
      </div>
      <ul className="mb-1.5 list-disc pl-5">
        <li>
          <strong>Mở đầu:</strong> &ldquo;Dear Organizing Committee,&rdquo; hoặc
          &ldquo;Dear Conference Secretariat,&rdquo;
        </li>
        <li>
          <strong>Đoạn 1 (Mục đích):</strong> Nêu lý do viết thư đăng ký tham dự
          hội nghị và gửi kèm tóm tắt báo cáo.
        </li>
        <li>
          <strong>Đoạn 2 (Lý do & Kinh nghiệp):</strong> Tóm tắt chuyên khoa Cơ
          xương khớp, kinh nghiệm can thiệp siêu âm và lý do đề tài phù hợp với
          hội nghị.
        </li>
        <li>
          <strong>Đoạn 3 (Yêu cầu cụ thể):</strong> Hỏi về thời hạn nộp abstract
          và thủ tục cấp giấy mời/đăng ký cho đại biểu quốc tế.
        </li>
        <li>
          <strong>Kết thư:</strong> &ldquo;Sincerely,&rdquo; hoặc &ldquo;Best
          regards,&rdquo; kèm tên bạn.
        </li>
      </ul>
    </div>
  );
}
