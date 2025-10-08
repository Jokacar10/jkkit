//
//  MainViewModel.swift
//  TONWalletApp
//
//  Created by Nikita Rodionov on 06.10.2025.
//

import Foundation
import TONWalletKit

@MainActor
class MainViewModel: ObservableObject {
    @Published var state: State = .loading
    
    private let storage = WalletsStorage()
    
    func load() async {
        do {
            let wallets = try storage.wallets()
            
            if let wallet = wallets.first {
                let wallet = try await TONWallet.add(data: wallet.data)
                show(wallet: wallet)
            } else {
                state = .addWallet
            }
        } catch {
            state = .addWallet
        }
    }
    
    func show(wallet: TONWallet) {
        let viewModel = WalletViewModel(
            tonWallet: wallet,
            onRemove: { [weak self] in
                self?.state = .addWallet
            }
        )
        state = .wallet(viewModel: viewModel)
    }
}

extension MainViewModel {
    
    enum State {
        case loading
        case addWallet
        case wallet(viewModel: WalletViewModel)
    }
}
