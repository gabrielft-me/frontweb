"use client";

import { Check, Copy, Pencil, Plus, Trash2, X } from "lucide-react";
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
	const [isCreatingAgent, setIsCreatingAgent] = useState(false);
	const [showAgentModal, setShowAgentModal] = useState(false);
	const [showCreateAgentForm, setShowCreateAgentForm] = useState(false);
	const [newModelName, setNewModelName] = useState("");
	const [newAgentCredentials, setNewAgentCredentials] = useState<{
		agent_id: string;
		agent_secret: string;
		client_id: string;
		model_name: string;
	} | null>(null);
	const [copiedField, setCopiedField] = useState<string | null>(null);

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

	const generateRandomString = (length: number) => {
		const chars =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		let result = "";
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	};

	const handleCreateAgent = async (modelName: string) => {
		setIsCreatingAgent(true);
		const supabase = createClient();

		try {
			// Generate credentials
			const agentId = `agent_${generateRandomString(16)}`;
			const agentSecret = generateRandomString(32);
			const clientId = `client_${generateRandomString(16)}`;

			const credentials = {
				agent_id: agentId,
				agent_secret: agentSecret,
				client_id: clientId,
				model_name: modelName,
				user_id: user?.id,
				created_at: new Date().toISOString(),
				status: "active",
			};

			// Store in Supabase (agents table)
			const { error: insertError } = await supabase
				.from("agents")
				.insert([credentials]);

			if (insertError) {
				setError(`Error creating agent: ${insertError.message}`);
			} else {
				setNewAgentCredentials({
					agent_id: agentId,
					agent_secret: agentSecret,
					client_id: clientId,
					model_name: modelName,
				});
				setShowAgentModal(true);
				setError(null);
			}
		} catch (err) {
			console.error("Error:", err);
			setError("Error creating agent");
		} finally {
			setIsCreatingAgent(false);
		}
	};

	const copyToClipboard = (text: string, field: string) => {
		navigator.clipboard.writeText(text);
		setCopiedField(field);
		setTimeout(() => setCopiedField(null), 2000);
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
							Agent Console
						</h1>
						<p className="text-sm text-zinc-400 sm:text-base">
							Signed in as {user.email}
						</p>
					</div>
					<div className="flex gap-2">
						<Button
							onClick={() => setShowCreateAgentForm(true)}
							className="gap-2 bg-primary hover:bg-primary/90"
						>
							<Plus className="h-4 w-4" />
							Create Agent
						</Button>
						<Button
							onClick={signOut}
							variant="outline"
							className="w-full sm:w-auto"
						>
							Sign Out
						</Button>
					</div>
				</div>

				{/* Agents Section */}
				<div className="mb-8">
					<h2 className="mb-6 text-center font-semibold text-xl text-zinc-300 uppercase tracking-wider sm:text-2xl">
						Select an Agent to Begin Monitoring
					</h2>
					<div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
						{/* Agent 1 */}
						<div className="group cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900 p-6 transition-all hover:border-primary hover:bg-zinc-900/80 sm:p-8">
							<div className="flex flex-col items-center gap-4">
								<div className="flex w-full items-center justify-between">
									<div className="rounded-2xl bg-zinc-800 p-4">
										<svg
											className="h-8 w-8 text-primary"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											role="img"
											aria-label="Agent icon"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M13 10V3L4 14h7v7l9-11h-7z"
											/>
										</svg>
									</div>
									<div className="flex items-center gap-2">
										<div className="h-2 w-2 rounded-full bg-green-500" />
										<span className="text-green-400 text-xs uppercase tracking-wider">
											Online
										</span>
									</div>
								</div>
								<div className="w-full text-center">
									<h3 className="font-bold text-2xl text-white">Agent 1</h3>
									<p className="mt-1 text-sm text-zinc-400">
										Unit ID: agent-001
									</p>
								</div>
							</div>
						</div>

						{/* Agent 2 */}
						<div className="group cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900 p-6 transition-all hover:border-primary hover:bg-zinc-900/80 sm:p-8">
							<div className="flex flex-col items-center gap-4">
								<div className="flex w-full items-center justify-between">
									<div className="rounded-2xl bg-zinc-800 p-4">
										<svg
											className="h-8 w-8 text-primary"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											role="img"
											aria-label="Agent icon"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M13 10V3L4 14h7v7l9-11h-7z"
											/>
										</svg>
									</div>
									<div className="flex items-center gap-2">
										<div className="h-2 w-2 rounded-full bg-green-500" />
										<span className="text-green-400 text-xs uppercase tracking-wider">
											Online
										</span>
									</div>
								</div>
								<div className="w-full text-center">
									<h3 className="font-bold text-2xl text-white">Agent 2</h3>
									<p className="mt-1 text-sm text-zinc-400">
										Unit ID: agent-002
									</p>
								</div>
							</div>
						</div>

						{/* Agent 3 */}
						<div className="group cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900 p-6 transition-all hover:border-primary hover:bg-zinc-900/80 sm:p-8">
							<div className="flex flex-col items-center gap-4">
								<div className="flex w-full items-center justify-between">
									<div className="rounded-2xl bg-zinc-800 p-4">
										<svg
											className="h-8 w-8 text-primary"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											role="img"
											aria-label="Agent icon"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M13 10V3L4 14h7v7l9-11h-7z"
											/>
										</svg>
									</div>
									<div className="flex items-center gap-2">
										<div className="h-2 w-2 rounded-full bg-yellow-500" />
										<span className="text-xs text-yellow-400 uppercase tracking-wider">
											Idle
										</span>
									</div>
								</div>
								<div className="w-full text-center">
									<h3 className="font-bold text-2xl text-white">Agent 3</h3>
									<p className="mt-1 text-sm text-zinc-400">
										Unit ID: agent-003
									</p>
								</div>
							</div>
						</div>
					</div>
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
																		key={`cell-${idx}-${
																			rowKeys[cellIdx] || cellIdx
																		}`}
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

				{/* Create Agent Form Modal */}
				{showCreateAgentForm && (
					<>
						{/* biome-ignore lint/a11y/useKeyWithClickEvents: Modal backdrop requires click to close */}
						{/* biome-ignore lint/a11y/noStaticElementInteractions: Modal backdrop requires click to close */}
						<div
							className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
							onClick={() => setShowCreateAgentForm(false)}
						>
							<div
								className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
								onClick={(e) => e.stopPropagation()}
								onKeyDown={(e) => {
									e.stopPropagation();
									if (e.key === "Escape") setShowCreateAgentForm(false);
								}}
								role="dialog"
								tabIndex={-1}
							>
								<h3 className="mb-4 font-bold text-white text-xl">
									Create New Agent
								</h3>
								<div className="space-y-4">
									<div>
										<label
											htmlFor="model-name"
											className="mb-2 block text-sm text-zinc-300"
										>
											Model Name
										</label>
										<input
											id="model-name"
											type="text"
											value={newModelName}
											onChange={(e) => setNewModelName(e.target.value)}
											placeholder="e.g., GPT-4, Claude, Gemini"
											className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-primary focus:outline-none"
										/>
									</div>
									<div className="flex justify-end gap-3">
										<Button
											onClick={() => {
												setShowCreateAgentForm(false);
												setNewModelName("");
											}}
											variant="outline"
										>
											Cancel
										</Button>
										<Button
											onClick={() => {
												if (newModelName.trim()) {
													handleCreateAgent(newModelName);
													setShowCreateAgentForm(false);
													setNewModelName("");
												}
											}}
											disabled={!newModelName.trim() || isCreatingAgent}
											className="bg-primary hover:bg-primary/90"
										>
											{isCreatingAgent ? "Creating..." : "Create Agent"}
										</Button>
									</div>
								</div>
							</div>
						</div>
					</>
				)}

				{/* Agent Credentials Modal */}
				{showAgentModal && newAgentCredentials && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
						<div className="w-full max-w-2xl rounded-lg border border-zinc-800 bg-zinc-900 shadow-2xl">
							<div className="border-zinc-800 border-b p-6">
								<h3 className="font-bold text-white text-xl">
									Agent Created Successfully!
								</h3>
								<p className="mt-1 text-sm text-zinc-400">
									Save these credentials securely. You won't be able to see the
									agent_secret again.
								</p>
							</div>

							<div className="space-y-4 p-6">
								{/* Agent ID */}
								<div>
									<label
										htmlFor="agent-id"
										className="mb-2 block font-medium text-sm text-zinc-300"
									>
										Agent ID
									</label>
									<div className="flex gap-2">
										<input
											id="agent-id"
											type="text"
											value={newAgentCredentials.agent_id}
											readOnly
											className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
										/>
										<Button
											onClick={() =>
												copyToClipboard(
													newAgentCredentials.agent_id,
													"agent_id",
												)
											}
											variant="outline"
											size="sm"
											className="gap-2"
										>
											{copiedField === "agent_id" ? (
												<>
													<Check className="h-4 w-4" />
													Copied
												</>
											) : (
												<>
													<Copy className="h-4 w-4" />
													Copy
												</>
											)}
										</Button>
									</div>
								</div>

								{/* Agent Secret */}
								<div>
									<label
										htmlFor="agent-secret"
										className="mb-2 block font-medium text-sm text-zinc-300"
									>
										Agent Secret
									</label>
									<div className="flex gap-2">
										<input
											id="agent-secret"
											type="text"
											value={newAgentCredentials.agent_secret}
											readOnly
											className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-sm text-white"
										/>
										<Button
											onClick={() =>
												copyToClipboard(
													newAgentCredentials.agent_secret,
													"agent_secret",
												)
											}
											variant="outline"
											size="sm"
											className="gap-2"
										>
											{copiedField === "agent_secret" ? (
												<>
													<Check className="h-4 w-4" />
													Copied
												</>
											) : (
												<>
													<Copy className="h-4 w-4" />
													Copy
												</>
											)}
										</Button>
									</div>
								</div>

								{/* Client ID */}
								<div>
									<label
										htmlFor="client-id"
										className="mb-2 block font-medium text-sm text-zinc-300"
									>
										Client ID (OAuth)
									</label>
									<div className="flex gap-2">
										<input
											id="client-id"
											type="text"
											value={newAgentCredentials.client_id}
											readOnly
											className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
										/>
										<Button
											onClick={() =>
												copyToClipboard(
													newAgentCredentials.client_id,
													"client_id",
												)
											}
											variant="outline"
											size="sm"
											className="gap-2"
										>
											{copiedField === "client_id" ? (
												<>
													<Check className="h-4 w-4" />
													Copied
												</>
											) : (
												<>
													<Copy className="h-4 w-4" />
													Copy
												</>
											)}
										</Button>
									</div>
								</div>

								{/* Model Name */}
								<div>
									<label
										htmlFor="model-name-display"
										className="mb-2 block font-medium text-sm text-zinc-300"
									>
										Model Name
									</label>
									<input
										id="model-name-display"
										type="text"
										value={newAgentCredentials.model_name}
										readOnly
										className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
									/>
								</div>
							</div>

							<div className="border-zinc-800 border-t p-6">
								<Button
									onClick={() => {
										setShowAgentModal(false);
										setNewAgentCredentials(null);
									}}
									className="w-full bg-primary hover:bg-primary/90"
								>
									Done
								</Button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
