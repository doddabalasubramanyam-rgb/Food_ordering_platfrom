package com.foodzone.app.service;

import com.foodzone.app.entity.Product;
import com.foodzone.app.entity.User;
import com.foodzone.app.repository.ProductRepository;
import com.foodzone.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    private User getLoggedInUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    public List<Product> getAllActiveProducts() {
        return productRepository.findByIsAvailableTrue();
    }

    public List<Product> getSupplierProducts() {
        User supplier = getLoggedInUser();
        return productRepository.findBySupplierId(supplier.getId());
    }

    public Product addProduct(Product product) {
        User supplier = getLoggedInUser();
        product.setSupplier(supplier);
        if (product.getIsAvailable() == null) {
            product.setIsAvailable(true);
        }
        product.setInitialStockQty(product.getStockQty());
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product updatedProduct) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));

        User supplier = getLoggedInUser();
        if (!existingProduct.getSupplier().getId().equals(supplier.getId())) {
            throw new IllegalStateException("You are not authorized to update this product!");
        }

        existingProduct.setName(updatedProduct.getName());
        existingProduct.setCategory(updatedProduct.getCategory());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setStockQty(updatedProduct.getStockQty());
        existingProduct.setInitialStockQty(updatedProduct.getStockQty());
        if (updatedProduct.getIsAvailable() != null) {
            existingProduct.setIsAvailable(updatedProduct.getIsAvailable());
        } else {
            existingProduct.setIsAvailable(updatedProduct.getStockQty() > 0);
        }

        return productRepository.save(existingProduct);
    }

    public void deleteProduct(Long id) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));

        User supplier = getLoggedInUser();
        if (!existingProduct.getSupplier().getId().equals(supplier.getId())) {
            throw new IllegalStateException("You are not authorized to delete this product!");
        }

        productRepository.delete(existingProduct);
    }
}
