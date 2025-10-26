"use client";

import { Pencil, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";

interface DatabaseTable {
	name: string;
	schema: string;
}

export default function ConsolePage() {
	const { user, signOut, loading, hasConsent } = useAuth();
	const router = useRouter();
	const [tables, setTables] = useState<DatabaseTable[]>([]);
	const [selectedTable, setSelectedTable] = useState<string | null>(null);
	const [tableData, setTableData] = useState<Record<string, unknown>[]>([]);
	const [loadingTables, setLoadingTables] = useState(false);
	const [loadingData, setLoadingData] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [manualTableName, setManualTableName] = useState("");
	const [selectedRow, setSelectedRow] = useState<Record<
		string,
		unknown
	> | null>(null);
	const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editFormData, setEditFormData] = useState<Record<string, unknown>>({});
	const [isUpdating, setIsUpdating] = useState(false);

	useEffect(() => {
		if (!loading && !user) {
			router.push("/");
		}
	}, [user, loading, router]);

	useEffect(() => {
		if (user) {
			loadTables();
		}
	}, [user]);

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isEditModalOpen) {
				handleCloseEditModal();
			}
		};

		window.addEventListener("keydown", handleEscape);
		return () => window.removeEventListener("keydown", handleEscape);
	}, [isEditModalOpen]);

	const loadTables = async () => {
		setLoadingTables(true);
		setError(null);

		try {
			const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
			const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

			if (!supabaseUrl || !supabaseKey) {
				throw new Error("Missing Supabase environment variables");
			}

			// Fetch the OpenAPI spec from Supabase REST API
			const response = await fetch(`${supabaseUrl}/rest/v1/`, {
				headers: {
					apikey: supabaseKey,
					Authorization: `Bearer ${supabaseKey}`,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch API schema");
			}

			const schema = await response.json();

			// Extract table names from OpenAPI definitions or paths
			const tableNames: string[] = [];

			// Try to get from paths (REST endpoints)
			if (schema.paths) {
				for (const path of Object.keys(schema.paths)) {
					// Paths like "/" indicate table endpoints
					const tableName = path.replace(/^\//, "").split("?")[0];
					if (
						tableName &&
						!tableName.includes("{") &&
						!tableNames.includes(tableName)
					) {
						tableNames.push(tableName);
					}
				}
			}

			// Try to get from definitions/components
			if (schema.definitions) {
				for (const def of Object.keys(schema.definitions)) {
					if (!tableNames.includes(def)) {
						tableNames.push(def);
					}
				}
			}

			if (tableNames.length > 0) {
				setTables(
					tableNames.map((name) => ({
						name,
						schema: "public",
					})),
				);
				setError(null);
			} else {
				setError(
					"No tables found. Create tables in Supabase Dashboard or enter table names manually below.",
				);
				setTables([]);
			}
		} catch (err) {
			console.error("Error:", err);
			setError(
				"Unable to auto-detect tables. You can still manually enter table names below.",
			);
			setTables([]);
		} finally {
			setLoadingTables(false);
		}
	};

	const loadTableData = async (tableName: string) => {
		setLoadingData(true);
		setError(null);
		const supabase = createClient();

		try {
			const { data, error } = await supabase.from(tableName).select("*");

			if (error) {
				console.error("Error loading table data:", error);
				setError(`Error loading data from ${tableName}: ${error.message}`);
			} else {
				setTableData(data || []);
			}
		} catch (err) {
			console.error("Error:", err);
			setError("Error loading table data");
		} finally {
			setLoadingData(false);
		}
	};

	const handleTableSelect = (tableName: string) => {
		setSelectedTable(tableName);
		setSelectedRow(null);
		setSelectedRowIndex(null);
		loadTableData(tableName);
	};

	const handleRowClick = (row: Record<string, unknown>, index: number) => {
		if (selectedRowIndex === index) {
			setSelectedRow(null);
			setSelectedRowIndex(null);
		} else {
			setSelectedRow(row);
			setSelectedRowIndex(index);
		}
	};

	const handleDeleteRow = async () => {
		if (!selectedRow || !selectedTable) return;

		setIsDeleting(true);
		const supabase = createClient();

		try {
			// Find primary key or id field
			const idField = Object.keys(selectedRow).find(
				(key) => key === "id" || key.endsWith("_id") || key === "uuid",
			);

			if (!idField) {
				setError(
					"Cannot delete: No ID field found. Table must have an 'id' or primary key column.",
				);
				return;
			}

			const { error: deleteError } = await supabase
				.from(selectedTable)
				.delete()
				.eq(idField, selectedRow[idField]);

			if (deleteError) {
				setError(`Error deleting row: ${deleteError.message}`);
			} else {
				// Refresh table data
				await loadTableData(selectedTable);
				setSelectedRow(null);
				setSelectedRowIndex(null);
				setError(null);
			}
		} catch (err) {
			console.error("Error:", err);
			setError("Error deleting row");
		} finally {
			setIsDeleting(false);
		}
	};

	const handleOpenEditModal = () => {
		if (selectedRow) {
			setEditFormData({ ...selectedRow });
			setIsEditModalOpen(true);
		}
	};

	const handleCloseEditModal = () => {
		setIsEditModalOpen(false);
		setEditFormData({});
	};

	const handleEditFieldChange = (field: string, value: string) => {
		setEditFormData((prev: Record<string, unknown>) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleUpdateRow = async () => {
		if (!selectedRow || !selectedTable) return;

		setIsUpdating(true);
		const supabase = createClient();

		try {
			// Find primary key or id field
			const idField = Object.keys(selectedRow).find(
				(key) => key === "id" || key.endsWith("_id") || key === "uuid",
			);

			if (!idField) {
				setError(
					"Cannot update: No ID field found. Table must have an 'id' or primary key column.",
				);
				return;
			}

			// Remove the ID field from update data
			const updateData = { ...editFormData };
			delete updateData[idField];

			const { error: updateError } = await supabase
				.from(selectedTable)
				.update(updateData)
				.eq(idField, selectedRow[idField]);

			if (updateError) {
				setError(`Error updating row: ${updateError.message}`);
			} else {
				// Refresh table data
				await loadTableData(selectedTable);
				setSelectedRow(null);
				setSelectedRowIndex(null);
				handleCloseEditModal();
				setError(null);
			}
		} catch (err) {
			console.error("Error:", err);
			setError("Error updating row");
		} finally {
			setIsUpdating(false);
		}
	};

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p className="text-zinc-400">Loading...</p>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	// Wait for consent before showing console
	if (!hasConsent) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<div className="text-center">
					<p className="text-zinc-400">
						Please accept the terms of consent to continue...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
			<div className="mx-auto max-w-7xl">
				{/* Header */}
				<div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="font-bold text-2xl text-white sm:text-3xl">
							Database Console
						</h1>
						<p className="text-sm text-zinc-400 sm:text-base">
							Signed in as {user.email}
						</p>
					</div>
					<Button
						onClick={signOut}
						variant="outline"
						className="w-full sm:w-auto"
					>
						Sign Out
					</Button>
				</div>

				{/* Error Display */}
				{error && (
					<div className="mb-4 rounded-lg border border-red-500 bg-red-500/10 p-4">
						<p className="text-red-400">{error}</p>
					</div>
				)}

				<div className="grid gap-4 sm:gap-6 lg:grid-cols-[320px_1fr]">
					{/* Sidebar - Tables List */}
					<div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 sm:p-6">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="font-semibold text-lg text-white">Tables</h2>
							<Button
								onClick={loadTables}
								size="sm"
								variant="ghost"
								disabled={loadingTables}
							>
								{loadingTables ? "Loading..." : "Refresh"}
							</Button>
						</div>
						{/* Manual Table Input */}
						<div className="mb-4 space-y-2">
							<label htmlFor="manual-table" className="text-sm text-zinc-400">
								Enter table name:
							</label>
							<div className="flex gap-2">
								<input
									id="manual-table"
									type="text"
									value={manualTableName}
									onChange={(e) => setManualTableName(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter" && manualTableName.trim()) {
											handleTableSelect(manualTableName.trim());
											setManualTableName("");
										}
									}}
									placeholder="e.g. users, posts"
									className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-primary focus:outline-none"
								/>
								<Button
									onClick={() => {
										if (manualTableName.trim()) {
											handleTableSelect(manualTableName.trim());
											setManualTableName("");
										}
									}}
									size="sm"
									disabled={!manualTableName.trim()}
								>
									Load
								</Button>
							</div>
						</div>

						<div className="space-y-2">
							{tables.length === 0 && !loadingTables ? (
								<div className="space-y-4">
									<p className="text-sm text-zinc-400">
										No tables auto-detected. Enter a table name above to view
										its data.
									</p>
									<div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4">
										<h3 className="mb-2 font-semibold text-sm text-white">
											Common Tables
										</h3>
										<p className="mb-3 text-xs text-zinc-400">
											Try these common table names:
										</p>
										<div className="flex flex-wrap gap-2">
											{["users", "posts", "profiles", "products"].map(
												(tableName) => (
													<button
														key={tableName}
														type="button"
														onClick={() => handleTableSelect(tableName)}
														className="rounded-md border border-zinc-600 bg-zinc-700 px-3 py-1 text-xs text-zinc-300 transition-colors hover:border-primary hover:bg-zinc-600"
													>
														{tableName}
													</button>
												),
											)}
										</div>
									</div>
								</div>
							) : (
								tables.map((table) => (
									<button
										key={table.name}
										type="button"
										onClick={() => handleTableSelect(table.name)}
										className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
											selectedTable === table.name
												? "bg-primary text-white"
												: "text-zinc-400 hover:bg-zinc-800 hover:text-white"
										}`}
									>
										{table.name}
									</button>
								))
							)}
						</div>
					</div>

					{/* Main Content - Table Data */}
					<div className="flex flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
						{!selectedTable ? (
							<div className="flex h-full min-h-[400px] items-center justify-center p-4 sm:p-6">
								<p className="text-zinc-400">Select a table to view its data</p>
							</div>
						) : (
							<div className="flex flex-col overflow-hidden">
								<div className="flex items-center justify-between border-zinc-800 border-b p-4 sm:p-6">
									<h2 className="font-semibold text-white text-xl">
										{selectedTable}
									</h2>
									{selectedRow && (
										<div className="flex gap-2">
											<Button
												onClick={handleOpenEditModal}
												variant="outline"
												size="sm"
												className="gap-2"
											>
												<Pencil className="h-4 w-4" />
												Edit Row
											</Button>
											<Button
												onClick={handleDeleteRow}
												disabled={isDeleting}
												variant="destructive"
												size="sm"
												className="gap-2 bg-red-600 hover:bg-red-700"
											>
												<Trash2 className="h-4 w-4" />
												{isDeleting ? "Deleting..." : "Delete Row"}
											</Button>
										</div>
									)}
								</div>

								{loadingData ? (
									<div className="p-4 sm:p-6">
										<p className="text-zinc-400">Loading data...</p>
									</div>
								) : tableData.length === 0 ? (
									<div className="p-4 sm:p-6">
										<p className="text-zinc-400">No data in this table</p>
									</div>
								) : (
									<div className="max-h-[calc(100vh-300px)] overflow-auto">
										<table className="w-full border-collapse">
											<thead className="sticky top-0 z-10 bg-zinc-800/50">
												<tr>
													{Object.keys(tableData[0] || {}).map((key) => (
														<th
															key={key}
															className="border-zinc-700 border-b px-3 py-2 text-left font-semibold text-xs text-zinc-400 uppercase tracking-wider sm:px-4 sm:py-3"
														>
															<div className="min-w-[120px] max-w-[250px] truncate">
																{key}
															</div>
														</th>
													))}
												</tr>
											</thead>
											<tbody className="divide-y divide-zinc-800">
												{tableData.map((row, idx) => {
													const rowKeys = Object.keys(row);
													// Try to find a stable ID for the key
													const rowId =
														(row.id as string | number | undefined) ||
														(row.uuid as string | undefined) ||
														(Object.entries(row).find(([k]) =>
															k.endsWith("_id"),
														)?.[1] as string | number | undefined) ||
														idx;
													return (
														<tr
															key={`row-${rowId}`}
															onClick={() => handleRowClick(row, idx)}
															className={`cursor-pointer transition-colors ${
																selectedRowIndex === idx
																	? "bg-primary/20 hover:bg-primary/30"
																	: "hover:bg-zinc-800/30"
															}`}
														>
															{Object.values(row).map(
																(value: unknown, cellIdx) => (
																	<td
																		key={`cell-${idx}-${rowKeys[cellIdx] || cellIdx}`}
																		className="border-zinc-800 border-b px-3 py-2 text-sm text-zinc-300 sm:px-4 sm:py-3"
																	>
																		<div
																			className="min-w-[120px] max-w-[250px] overflow-hidden truncate"
																			title={
																				typeof value === "object"
																					? JSON.stringify(value)
																					: value === null
																						? "null"
																						: String(value)
																			}
																		>
																			{typeof value === "object" ? (
																				JSON.stringify(value)
																			) : value === null ? (
																				<span className="text-zinc-500 italic">
																					null
																				</span>
																			) : (
																				String(value)
																			)}
																		</div>
																	</td>
																),
															)}
														</tr>
													);
												})}
											</tbody>
										</table>
									</div>
								)}
							</div>
						)}
					</div>
				</div>

				{/* Edit Modal */}
				{isEditModalOpen && (
					<button
						type="button"
						className="fixed inset-0 z-50 flex items-center justify-center border-0 bg-black/50 p-4 outline-0"
						onClick={handleCloseEditModal}
					>
						<div
							className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg border border-zinc-800 bg-zinc-900 shadow-2xl"
							onClick={(e) => e.stopPropagation()}
							onKeyDown={(e) => e.stopPropagation()}
							role="dialog"
							tabIndex={-1}
						>
							{/* Modal Header */}
							<div className="flex items-center justify-between border-zinc-800 border-b p-4 sm:p-6">
								<h3 className="font-semibold text-white text-xl">Edit Row</h3>
								<button
									type="button"
									onClick={handleCloseEditModal}
									className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
								>
									<X className="h-5 w-5" />
								</button>
							</div>

							{/* Modal Body */}
							<div className="p-4 sm:p-6">
								<div className="space-y-4">
									{Object.keys(editFormData).map((field) => {
										const value = editFormData[field];
										const isIdField =
											field === "id" ||
											field.endsWith("_id") ||
											field === "uuid";

										return (
											<div key={field} className="space-y-2">
												<label
													htmlFor={field}
													className="block font-medium text-sm text-zinc-300"
												>
													{field}
													{isIdField && (
														<span className="ml-2 text-xs text-zinc-500">
															(read-only)
														</span>
													)}
												</label>
												{typeof value === "object" && value !== null ? (
													<textarea
														id={field}
														value={JSON.stringify(value, null, 2)}
														onChange={(e) => {
															try {
																const parsed = JSON.parse(e.target.value);
																handleEditFieldChange(field, parsed);
															} catch {
																// Invalid JSON, keep as string
															}
														}}
														disabled={isIdField}
														className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-sm text-white placeholder-zinc-500 focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
														rows={4}
													/>
												) : (
													<input
														id={field}
														type="text"
														value={value === null ? "" : String(value)}
														onChange={(e) =>
															handleEditFieldChange(field, e.target.value)
														}
														disabled={isIdField}
														className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
													/>
												)}
											</div>
										);
									})}
								</div>
							</div>

							{/* Modal Footer */}
							<div className="flex justify-end gap-3 border-zinc-800 border-t p-4 sm:p-6">
								<Button
									onClick={handleCloseEditModal}
									variant="outline"
									disabled={isUpdating}
								>
									Cancel
								</Button>
								<Button
									onClick={handleUpdateRow}
									disabled={isUpdating}
									className="bg-primary hover:bg-primary/90"
								>
									{isUpdating ? "Saving..." : "Save Changes"}
								</Button>
							</div>
						</div>
					</button>
				)}
			</div>
		</div>
	);
}
