import { forwardRef } from "react";

interface InvoiceProps {
  order: any;
}

export const Invoice = forwardRef<HTMLDivElement, InvoiceProps>(
  ({ order }, ref) => {
    if (!order) return null;

    const dateStr = order.metadata?.createdAt?.toDate
      ? order.metadata.createdAt.toDate().toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : new Date().toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

    const isLunas = order.status?.payment === "Lunas";

    // Support new items array or legacy format
    const items = order.orderDetails?.items || [
      {
        name: order.orderDetails?.serviceName || "Unknown Service",
        addon: order.orderDetails?.serviceAddon || "",
        qty: 1,
        price: order.orderDetails?.price || 0,
      },
    ];

    const subtotal =
      order.orderDetails?.subtotal ?? order.orderDetails?.price ?? 0;
    const discount = order.orderDetails?.discount ?? 0;
    const total = order.orderDetails?.total ?? subtotal;

    return (
      <div
        ref={ref}
        className="bg-white p-10 max-w-[800px] w-full mx-auto relative font-sans text-slate-900 border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-8"
        style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
      >
        {/* LUNAS Stamp */}
        {isLunas && (
          <div className="absolute top-10 right-10 text-center z-10">
            <div className="inline-block text-emerald-600 font-bold uppercase text-2xl tracking-[2px] px-4 py-2 border-[3px] border-emerald-600 rounded bg-emerald-600/5 -rotate-6">
              LUNAS
            </div>
          </div>
        )}

        {/* Header */}
        <header className="flex justify-between items-start border-b-[2px] border-slate-900 pb-6 mb-8 mt-4">
          <div>
            <h1 className="m-0 text-[32px] font-bold tracking-tight uppercase text-slate-900 inline-block border-b-[3px] border-emerald-500 pb-1">
              HIRO STUDIO
            </h1>
            <p className="m-0 mt-2 text-[13px] font-medium text-slate-600 uppercase tracking-widest">
              Visual Design & Web Development
            </p>
          </div>
          <div className="text-right mt-14">
            <h2 className="m-0 text-lg font-semibold text-slate-600 uppercase tracking-wide">
              {isLunas ? "RECEIPT" : "INVOICE"}
            </h2>
            <p className="m-0 mt-1.5 text-base font-bold text-slate-900">
              {order.id}
            </p>
          </div>
        </header>

        {/* Info Section */}
        <div className="flex justify-between mb-10">
          <div>
            <h4 className="m-0 mb-2 text-slate-600 uppercase text-[11px] tracking-wide font-medium">
              TAGIHAN UNTUK:
            </h4>
            <p className="m-0 text-[15px] font-bold text-slate-900">
              {order.client.name}
            </p>
            <p className="m-0 mt-0.5 text-sm text-slate-500 font-medium">
              {order.client.whatsapp}
            </p>
          </div>
          <div className="text-right">
            <h4 className="m-0 mb-2 text-slate-600 uppercase text-[11px] tracking-wide font-medium">
              TANGGAL TERBIT:
            </h4>
            <p className="m-0 text-[15px] font-bold text-slate-900">
              {dateStr} WIB
            </p>
            <div className="mt-4">
              <h4 className="m-0 mb-1 text-slate-600 uppercase text-[11px] tracking-wide font-medium">
                STATUS:
              </h4>
              <p
                className={`m-0 text-[13px] font-bold uppercase ${isLunas ? "text-emerald-600" : "text-red-500"}`}
              >
                {order.status?.payment}
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full border-collapse mb-8 text-left">
          <thead>
            <tr>
              <th className="bg-slate-50 py-3 px-4 border-y-2 border-slate-200 text-[12px] font-semibold uppercase tracking-widest">
                DESKRIPSI ITEM
              </th>
              <th className="bg-slate-50 py-3 px-4 border-y-2 border-slate-200 text-[12px] font-semibold uppercase tracking-widest text-center w-[10%]">
                QTY
              </th>
              {items.some((i: any) => i.deadline) && (
                <th className="bg-slate-50 py-3 px-4 border-y-2 border-slate-200 text-[12px] font-semibold uppercase tracking-widest text-center w-[18%]">
                  DEADLINE
                </th>
              )}
              <th className="bg-slate-50 py-3 px-4 border-y-2 border-slate-200 text-[12px] font-semibold uppercase tracking-widest text-right w-[22%]">
                HARGA
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, idx: number) => (
              <tr key={idx}>
                <td className="py-4 px-4 border-b border-slate-200 align-top">
                  <span className="block font-semibold text-[14px] text-slate-900">
                    {item.name}
                  </span>
                  {item.addon && (
                    <span className="block text-[12px] text-slate-600 mt-1 font-medium">
                      {item.addon}
                    </span>
                  )}
                </td>
                <td className="py-4 px-4 border-b border-slate-200 align-top text-center font-medium">
                  {item.qty}
                </td>
                {items.some((i: any) => i.deadline) && (
                  <td className="py-4 px-4 border-b border-slate-200 align-top text-center text-[13px] text-slate-700">
                    {item.deadline
                      ? new Date(item.deadline).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </td>
                )}
                <td className="py-4 px-4 border-b border-slate-200 align-top text-right font-medium text-slate-900">
                  Rp{" "}
                  {(Number(item.price) * Number(item.qty)).toLocaleString(
                    "id-ID",
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total Section */}
        <div className="w-[320px] ml-auto">
          <div className="flex justify-between py-1.5 text-[14px] text-slate-700 font-medium">
            <span>Subtotal</span>
            <span>Rp {subtotal.toLocaleString("id-ID")}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between py-1.5 text-[14px] text-red-600 font-medium tracking-tight">
              <span>Discount</span>
              <span>- Rp {discount.toLocaleString("id-ID")}</span>
            </div>
          )}
          <div className="flex justify-between py-1.5 text-[14px] text-slate-600">
            <span>Sudah Dibayar</span>
            <span>(Rp {isLunas ? total.toLocaleString("id-ID") : "0"})</span>
          </div>
          <div className="flex justify-between mt-3 pt-3.5 border-t-[3px] border-slate-900 font-bold text-[18px] text-slate-900">
            <span>SISA TAGIHAN</span>
            <span>Rp {isLunas ? 0 : total.toLocaleString("id-ID")}</span>
          </div>
        </div>
        <div className="clear-both"></div>

        {/* Footer */}
        <footer className="mt-[100px] text-[11px] text-slate-500 text-center border-t border-slate-200 pt-6 leading-relaxed">
          <p className="m-0">
            Terima kasih telah menggunakan jasa Hiro Studio.
            <br />
            Ini adalah bukti pembayaran sah. File final akan segera dikirimkan
            melalui platform yang disepakati.
          </p>
        </footer>
      </div>
    );
  },
);

Invoice.displayName = "Invoice";
