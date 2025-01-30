"use client";

import tokenizationABI from "@/app/abi/tokenizationABI";
import { Button } from "@/components/ui/button";
import { modal } from "@/context";
import { toast } from "@/hooks/use-toast";
import { SUPPORTED_CHAINS } from "@/lib/chains";
import { supabase } from "@/lib/supabase";
import { holesky } from "@reown/appkit/networks";
import { useAppKitProvider, useAppKitState } from "@reown/appkit/react";
import { ethers } from "ethers";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { parseEther } from "viem";
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";

type TokenizationRequest = {
  id: string;
  diamond_id: string;
  total_supply: number;
  price_per_token: number;
  status: string;
  diamond: {
    name: string;
    carat: number;
    color: string;
    clarity: string;
    cut: string;
    certificate_number: string;
  };
};

export default function TokenizationRequests() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<TokenizationRequest[]>([]);
  const [agents, setAgents] = useState<
    { id: string; email: string; wallet_address: string }[]
  >([]);
  const [isTokenizing, setIsTokenizing] = useState(false);
  const { data: transactionReceipt, isLoading: isConfirming } =
    useWaitForTransactionReceipt({
      hash: undefined,
    });

  const appKitProvider = useAppKitProvider("eip155");
  const { open, activeChain, selectedNetworkId } = useAppKitState();
  const { sendTransaction } = useSendTransaction();
  const { address, isConnected } = useAccount();
  const { chain } = useAccount();

  useEffect(() => {
    console.log("AppKit State:", { open, activeChain, selectedNetworkId });
    console.log("Wagmi State:", { address, isConnected, chainId: chain?.id });
  }, [open, activeChain, selectedNetworkId, address, isConnected, chain]);

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchTokenizationRequests();
      fetchAgents();
    }
  }, [session]);

  const fetchTokenizationRequests = async () => {
    const { data, error } = await supabase
      .from("tokenization_requests")
      .select(
        `
        *,
        diamond:diamonds (*)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tokenization requests:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tokenization requests. Please try again.",
        variant: "destructive",
      });
    } else {
      setRequests(data);
    }
  };

  const fetchAgents = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, wallet_address")
      .eq("role", "agent");

    if (error) {
      console.error("Error fetching agents:", error);
      toast({
        title: "Error",
        description: "Failed to fetch agents. Please try again.",
        variant: "destructive",
      });
    } else {
      setAgents(data);
    }
  };

  const handleApprove = async (requestId: string, agentId: string) => {
    setIsTokenizing(true);
    try {
      if (!isConnected) {
        await modal.open();
        throw new Error("Please connect your wallet");
      }

      if (chain?.id !== SUPPORTED_CHAINS.HOLESKY) {
        await modal.switchNetwork(holesky);
        throw new Error("Please switch to the Holesky network");
      }

      const request = requests.find((r) => r.id === requestId);
      const agent = agents.find((a) => a.id === agentId);

      if (!request || !agent) {
        throw new Error("Invalid request or agent");
      }

      const contractAddress =
        process.env.NEXT_PUBLIC_TOKENIZATION_CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error("Contract address not found");
      }

      const contract = new ethers.Contract(contractAddress, tokenizationABI);
      const tokenizeDiamondData = contract.interface.encodeFunctionData(
        "tokenizeDiamond",
        [
          request.diamond.name,
          parseEther(request.diamond.carat.toString()),
          request.diamond.color,
          request.diamond.clarity,
          request.diamond.cut,
          request.diamond.certificate_number,
          request.total_supply,
          parseEther(request.price_per_token.toString()),
          agent.wallet_address,
        ]
      );

      const transactionRequest = {
        to: contractAddress,
        data: tokenizeDiamondData,
      };

      sendTransaction(transactionRequest, {
        onSuccess: async (data) => {
          const hash = data;
          console.log("Transaction hash:", hash);

          toast({
            title: "Transaction Sent",
            description: `Transaction hash: ${hash}`,
          });

          const receipt = await transactionReceipt;

          console.log("Transaction receipt:", receipt);

          // Wait for the transaction to be mined
          const provider = new ethers.JsonRpcProvider(
            process.env.NEXT_PUBLIC_RPC_URL
          );
          const result = await provider.waitForTransaction(hash);

          console.log('result', result)

          // Update the request status in the database
          const { error } = await supabase
            .from("tokenization_requests")
            .update({ status: "approved" })
            .eq("id", requestId);

          if (error) {
            throw error;
          }

          toast({
            title: "Success",
            description: "Diamond tokenized successfully.",
          });

          // Refresh the tokenization requests
          fetchTokenizationRequests();
        },
        onError: (error) => {
          console.error("Transaction error:", error);
          toast({
            title: "Error",
            description: "Failed to send transaction. Please try again.",
            variant: "destructive",
          });
        },
      });
    } catch (error) {
      console.error("Error tokenizing diamond:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to tokenize diamond. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTokenizing(false);
    }
  };

  if (session?.user?.role !== "admin") {
    return <div>Access denied. You must be an admin to view this page.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Tokenization Requests</h1>
      <div className="mb-4">
        <p>Wallet Status: {isConnected ? "Connected" : "Disconnected"}</p>
        <p>Wallet Address: {address || "Not available"}</p>
        <p>Network: {chain?.name || "Unknown"}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left">Diamond</th>
              <th className="py-2 px-4 text-left">Total Supply</th>
              <th className="py-2 px-4 text-left">Price per Token</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-t">
                <td className="py-2 px-4">
                  {request.diamond.name} - {request.diamond.carat} carats,{" "}
                  {request.diamond.color}, {request.diamond.clarity}
                </td>
                <td className="py-2 px-4">{request.total_supply}</td>
                <td className="py-2 px-4">{request.price_per_token} ETH</td>
                <td className="py-2 px-4">{request.status}</td>
                <td className="py-2 px-4">
                  {request.status === "pending" && (
                    <div className="flex items-center space-x-2">
                      <select
                        className="border rounded px-2 py-1"
                        onChange={(e) =>
                          handleApprove(request.id, e.target.value)
                        }
                        disabled={isTokenizing}
                      >
                        <option value="">Select Agent</option>
                        {agents.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.email}
                          </option>
                        ))}
                      </select>
                      <Button
                        onClick={() => handleApprove(request.id, "")}
                        disabled={isTokenizing || !isConnected}
                      >
                        {isTokenizing ? "Tokenizing..." : "Approve"}
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
