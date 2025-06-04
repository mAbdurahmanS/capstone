import { DataTable } from "@/components/data-table-user"

import data from "../data.json"

export default function Page() {
    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

                    <div className="flex items-center justify-between px-4 lg:px-6">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                Category Management
                            </h1>
                            <p className="text-gray-600">Monitor your helpdesk performance and system status</p>
                        </div>
                    </div>
                    <DataTable data={data} />
                </div>
            </div>
        </div>
    )
}
