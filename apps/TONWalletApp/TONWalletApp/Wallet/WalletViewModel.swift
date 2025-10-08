//
//  WalletViewModel.swift
//  TONWalletApp
//
//  Created by Nikita Rodionov on 30.09.2025.
//

import TONWalletKit

@MainActor
class WalletViewModel: Identifiable, ObservableObject {
    let id = UUID()

    let tonWallet: TONWallet
    let onRemove: () -> Void
    
    let info: WalletInfoViewModel
    let dAppConnection: WalletDAppConnectionViewModel
    let dAppDisconnect: WalletDAppDisconnectionViewModel
    
    private let storage = WalletsStorage()
    
    init(
        tonWallet: TONWallet,
        onRemove: @escaping () -> Void
    ) {
        self.tonWallet = tonWallet
        self.onRemove = onRemove
        
        self.info = WalletInfoViewModel(wallet: tonWallet)
        self.dAppConnection = WalletDAppConnectionViewModel(wallet: tonWallet)
        self.dAppDisconnect = WalletDAppDisconnectionViewModel(wallet: tonWallet)
    }
    
    func remove() {
        do {
            try storage.removeAllWallets()
            
            Task {
                try await tonWallet.remove()
            }
            
            onRemove()
        } catch {
            debugPrint(error.localizedDescription)
        }
    }
}
